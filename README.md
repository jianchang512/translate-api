提到网络菩萨想必很多人都知道，没错说的就是cloudflare，他家的几乎所有资源，包括但不限于cdn、kv数据库、Pages、Workers都提供大量的免费资源，并鼓励人们白嫖，更重要的是免费额度很高，一般微小企业或个人工作室，不花一毛钱都能撑得起自己的业务。

最近 cloudflare 又推出了免费AI服务，直接在他们网站后台，无需服务器、无需域名，简单几步操作就能搭建一个免费可用的AI服务，包括翻译、文本生成、文字生成图片、语音识别，真是一波福利，不要错过哦！

![image](https://github.com/jianchang512/translate-api/assets/3378335/71992dce-fc57-45e7-91dc-e97c4c7bfc47)


今天主要介绍下如何在cloudflare后台搭建一个可用的免费翻译api，使用 m2m100-1.2B 模型，实现后的效果如下

![image](https://github.com/jianchang512/translate-api/assets/3378335/37a49f22-b254-44f2-b73d-1d2c843fc16e)


## 本文主要包括：

1. 注册账号并登陆
2. 创建Worker服务
3. 复制粘贴代码并部署启动
4. 绑定自己的域名
5. 在代码中或软件中使用这个api

 
## 注册账号并登陆


如果还没有账号，点击这个地址去注册，这个很简单 https://dash.cloudflare.com/sign-up

如果有账号，直接去登录 https://dash.cloudflare.com/login

![image](https://github.com/jianchang512/translate-api/assets/3378335/4bb6d2dc-07d8-4ce3-99ff-a3ae5748c357)


## 创建Worker服务

登录后，点击左侧的“Workers和Pages”

![image](https://github.com/jianchang512/translate-api/assets/3378335/3fc15875-e83f-44e1-b7a0-6393098889ba)


然后点击“创建应用程序”

![image](https://github.com/jianchang512/translate-api/assets/3378335/e6ccc2d7-3a25-469a-919b-e2310e5b403c)


在打开的新页面中，下拉找到“翻译应用”，鼠标放上去，点击显示出来的“使用模板”

![image](https://github.com/jianchang512/translate-api/assets/3378335/cf76b6e4-d52c-4440-a190-811e6e6d113d)


在下一个界面中，设定一个名称， 这个名称将是分配给你的域名的一部分，只允许使用 数字、英文、下划线、中横线组成，如下图

![image](https://github.com/jianchang512/translate-api/assets/3378335/7dee3a69-8fe1-41a8-a755-3d193790de52)


定义好名称后，下拉页面，找到右下角“部署”按钮，点击

![image](https://github.com/jianchang512/translate-api/assets/3378335/464a1644-26e4-4521-9edf-309d0954118e)


接下来就会告诉你部署成功了，不过还需要粘贴代码去替换默认的。

![image](https://github.com/jianchang512/translate-api/assets/3378335/66590225-fc0f-42cc-8af6-1f8996d158fa)


## 复制粘贴代码并部署启动

点击上一步最后显示的“编辑代码”，等待页面显示，然后删掉左侧所有的代码，并粘贴以下代码到左侧,其中的 123456是你的访问密钥，可以修改下，防止它人使用浪费你的免费流量。

```

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
      source_lang: source_language,
      target_lang: target_language
    };
    const response = await ai.run('@cf/meta/m2m100-1.2b', inputs);
    if(response.translated_text.indexOf('ERROR')===0){
      return Response.json({code:2,msg:"ok",text:response.translated_text});
    }
    return Response.json({code:0,msg:"ok",text:response.translated_text });
  }
};

```

![image](https://github.com/jianchang512/translate-api/assets/3378335/193c18e4-98ef-419d-8cc9-868106a227f7)


粘贴后，等待右上角“保存并部署”可点击后，点击它，然后弹出的确认窗口中，再次确认并部署

![image](https://github.com/jianchang512/translate-api/assets/3378335/0c008725-cfbc-450d-8b94-c04939d1c5b8)


好了，可以愉快的使用了，比如我部署后的地址是 https://my-translate-api.2124455076.workers.dev/，那么我直接通过这个地址就可使用

https://my-translate-api.2124455076.workers.dev/?text=%E4%BD%A0%E5%A5%BD%E5%95%8A%E6%88%91%E7%9A%84%E6%9C%8B%E5%8F%8B&source_language=zh&target_language=en&secret=123456

![image](https://github.com/jianchang512/translate-api/assets/3378335/4a4b97ae-cb31-4aa5-b74e-59bd5dc49a14)


这个地址就是你的翻译API接口地址。

## 绑定自己的域名

如果觉得这个地址太长不好，或者有可能workers.dev 被墙，国内无法访问，而又不想挂代理，可以绑定自己的域名。

首先你需要把你的域名NS服务器修改为cloudflare的，等待生效后，回到cloudflare首页 https://dash.cloudflare.com/，绑定你的域名

> 
> NS	ezra.ns.cloudflare.com
> NS	karsyn.ns.cloudflare.com
>

![image](https://github.com/jianchang512/translate-api/assets/3378335/8dcc389a-c4d4-4758-8f5a-2dd279edd41a)


添加完后，再回到你的worker里，还记得怎么进入吗，点击左侧的“Workers和Pages”

![image](https://github.com/jianchang512/translate-api/assets/3378335/869396f1-6d07-4c7a-8f00-507c643ea3d4)


右侧就会看到你已创建好的服务，点击它的名称，进入设置页面

![image](https://github.com/jianchang512/translate-api/assets/3378335/5ba7039e-45da-411c-9f2e-3a19bac48846)


如下图所示，先点击“触发器”，再点击“添加自定义域”，就可以添加自己的域名了，比如你已绑定到 cloudflare的域名是 abc.com，那么这里可以设定 api.abc.com,

![image](https://github.com/jianchang512/translate-api/assets/3378335/cf330afe-7409-4c6d-ad97-b3a6d174e4ee)


好了，现在可以使用自己的域名访问了

![image](https://github.com/jianchang512/translate-api/assets/3378335/903b81b1-5730-4e32-a534-606c9cb0c293)


## 在代码和软件中使用这个api

首先要记下 m2m100可以支持的语言代码

```
阿非利卡语（af）、阿姆哈拉语（am）、阿拉伯语（ar）、阿斯图里亚斯语（ast）、阿塞拜疆语（az）、巴什基尔语（ba）、白俄罗斯语（be）、保加利亚语（bg）、孟加拉语（bn）、布列塔尼语（br）、波斯尼亚语（bs）、加泰罗尼亚语（ca）、宿务语（ceb）、捷克语（cs）、威尔士语（cy）、丹麦语（da）、德语（de）、希腊语（el）、英语（en）、西班牙语（es）、爱沙尼亚语（et）、波斯语（fa）、富拉语（ff）、芬兰语（fi）、法语（fr）、西弗里西亚语（fy）、爱尔兰语（ga）、苏格兰盖尔语（gd）、加利西亚语（gl）、古吉拉特语（gu）、豪萨语（ha）、希伯来语（he）、印地语（hi）、克罗地亚语（hr）、海地克里奥尔语（ht）、匈牙利语（hu）、亚美尼亚语（hy）、印度尼西亚语（id）、伊博语（ig）、伊洛卡诺语（ilo）、冰岛语（is）、意大利语（it）、日语（ja）、爪哇语（jv）、格鲁吉亚语（ka）、哈萨克语（kk）、中央高棉语（km）、卡纳达语（kn）、韩语（ko）、卢森堡语（lb）、甘达语（lg）、林加拉语（ln）、老挝语（lo）、立陶宛语（lt）、拉脱维亚语（lv）、马达加斯加语（mg）、马其顿语（mk）、马拉雅拉姆语（ml）、蒙古语（mn）、马拉地语（mr）、马来语（ms）、缅甸语（my）、尼泊尔语（ne）、荷兰语（nl）、挪威语（no）、北索托语（ns）、奥克西塔尼语（oc），奥里亚语（or）、旁遮普语（pa）、波兰语（pl）、普什图语（ps）、葡萄牙语（pt）、罗马尼亚语（ro）、俄语（ru）、信德语（sd）、僧伽罗语（si）、斯洛伐克语（sk）、斯洛文尼亚语（sl）、索马里语（so）、阿尔巴尼亚语（sq）、塞尔维亚语（sr）、斯瓦蒂语（ss）、巽他语（su）、瑞典语（sv）、斯瓦希里语（sw）、泰米尔语（ta）、泰语（th）、他加禄语（tl）、茨瓦纳语（tn）、土耳其语（tr）、乌克兰语（uk）、乌尔都语（ur）、乌兹别克语（uz）、越南语（vi）、沃洛夫语（wo）、科萨语（xh）、依地语（yi）、约鲁巴语（yo）、中文（zh）、祖鲁语（zu）

```

**在python代码使用这个api**

```
import requests
response = requests.get(url="https://transapi.pyvideotrans.com/?text=你好啊我的朋友们&source_language=zh&target_language=en&secret=123456")

print(response.json())

```

![image](https://github.com/jianchang512/translate-api/assets/3378335/090d60ec-81d2-4e43-8eb2-50ab39fdbe98)


就这么简单

**在视频翻译软件中使用**

打开左上角设置菜单--自定义翻译API，填写你的api地址和密钥，然后测试下

![image](https://github.com/jianchang512/translate-api/assets/3378335/ba602b3d-19ce-4ee1-b6b2-2270e3a15bc3)


没问题后，翻译渠道里选择“TransAPI” 就可以愉快的使用免费api、免费服务资源翻译你的视频了，免费额度一般每月也足够使用了。

![image](https://github.com/jianchang512/translate-api/assets/3378335/2579a904-4098-4be1-87ee-967d1356155f)


感谢网络菩萨。
