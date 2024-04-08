import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import { createStuffDocumentsChain } from 'langchain/chains/combine_documents';
import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';
import {
  RunnablePassthrough,
  RunnableSequence,
} from '@langchain/core/runnables';
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from '@langchain/core/prompts';
import type { BaseMessage } from '@langchain/core/messages';

const CHAT_MODEL = 'gpt-3.5-turbo';
const EMBEDDING_MODEL = 'text-embedding-3-small';

const readOpenAiKey = () => {
  return process.env.OPENAI_API_KEY as string;
};

const retriveFromPdf = async (filename: string) => {
  const loader = new PDFLoader(filename);

  const docs = await loader.load();

  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 3000,
    chunkOverlap: 0,
  });

  const splitedDocs = await textSplitter.splitDocuments(docs);
  const vectorstore = await MemoryVectorStore.fromDocuments(
    splitedDocs,
    new OpenAIEmbeddings({
      modelName: EMBEDDING_MODEL,
      openAIApiKey: readOpenAiKey(),
    }),
  );

  return vectorstore.asRetriever(4);
};

const parseRetrieverInput = (params: { messages: BaseMessage[] }) => {
  return params.messages[params.messages.length - 1].content;
};

export const createChain = async (pdfFilename: string) => {
  const chat = new ChatOpenAI({
    modelName: CHAT_MODEL,
    temperature: 0.2,
    openAIApiKey: readOpenAiKey(),
  });
  const retriever = await retriveFromPdf(pdfFilename);

  const SYSTEM_TEMPLATE = `Answer the user's questions based on the below context.
If the context doesn't contain any relevant information to the question, don't make something up and just say "I don't know":

<context>
{context}
</context>
`;

  const questionAnsweringPrompt = ChatPromptTemplate.fromMessages([
    ['system', SYSTEM_TEMPLATE],
    new MessagesPlaceholder('messages'),
  ]);

  const documentChain = await createStuffDocumentsChain({
    llm: chat,
    prompt: questionAnsweringPrompt,
  });

  const retrievalChain = RunnablePassthrough.assign({
    context: RunnableSequence.from([parseRetrieverInput, retriever]),
  }).assign({
    answer: documentChain,
  });

  return retrievalChain;
};
