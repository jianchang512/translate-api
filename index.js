// 使用这里的 代码替换掉 worker 里左侧编辑区的代码即可

import { Ai } from './vendor/@cloudflare/ai.js';

// 这是访问密钥
const SECRET_PASS="123456"

export default {
  async fetch(request, env) {
    const urlStr = request.url
    const urlObj = new URL(urlStr)
    let text =  urlObj.searchParams.get('text')
    let source_language = urlObj.searchParams.get('source_language')
    let target_language = urlObj.searchParams.get('target_language')
    let secret = urlObj.searchParams.get('secret')
    if(secret!==SECRET_PASS){
      return Response.json({code:1,msg:"无权访问",text:text,source_language:source_language,target_lanuage:target_language,secret:secret});
    }

    const ai = new Ai(env.AI);
    const inputs = {
      text: text,
      source_lang: source_language.substr(0,2),
      target_lang: target_language.substr(0,2)
    };
    const response = await ai.run('@cf/meta/m2m100-1.2b', inputs);
    if(response.translated_text.indexOf('ERROR')===0){
      return Response.json({code:2,msg:"ok",text:response.translated_text});
    }
    return Response.json({code:0,msg:"ok",text:response.translated_text });
  }
};
