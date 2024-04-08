import { HumanMessage } from '@langchain/core/messages';
import { input } from '@inquirer/prompts';

import { createChain } from './create-chain';

export const doAnalysis = async (pdfFilename: string) => {
  console.log('文档解析中...');
  const chain = await createChain(pdfFilename);

  console.log(`初始化成功，可开始交互`);
  while (true) {
    const question = await input({
      message: '输入你想问的问题，LLM 将根据 pdf 内容进行回答',
    });
    const res = await chain.invoke({
      messages: [new HumanMessage(question)],
    });
    console.log(res);
  }
};
