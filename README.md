---
theme: orange
---
提到网络菩萨想必很多人都知道，没错说的就是cloudflare，他家的几乎所有产品，包括但不限于cdn、kv数据库、Pages、Workers都提供大量的免费资源，并鼓励人们白嫖，更重要的是免费额度很高，一般微小企业或个人工作室，不花一毛钱都能撑得起自己的业务。

最近 cloudflare 又推出了免费AI服务，直接在他们网站后台，无需服务器、无需域名，简单几步操作就能搭建一个免费可用的AI服务，包括翻译、文本生成、文字生成图片、语音识别，真是一波福利，不要错过哦！


![image](https://github.com/jianchang512/translate-api/assets/3378335/f43c487f-a0d0-4c5b-8911-4aa04397bac2)


本文主要介绍下如何在cloudflare后台搭建一个可用的免费翻译api，使用 m2m100-1.2B 模型，实现后的效果如下

![image](https://github.com/jianchang512/translate-api/assets/3378335/26e18a0c-cb64-4149-b707-f41f9e37757f)


**本文主要包括：**

1. 注册账号并登陆
2. 创建Worker服务
3. 复制粘贴代码并部署启动
4. 绑定自己的域名(可选)
5. 在代码中或软件中使用这个api


## 1. 注册账号并登陆

如果还没有账号，点击这个地址去注册，这个很简单
https://dash.cloudflare.com/sign-up

如果有账号，直接去登录 https://dash.cloudflare.com/login

![image](https://github.com/jianchang512/translate-api/assets/3378335/4bfac0a5-08c4-472e-982b-524ff9b867a6)


## 2. 创建Worker服务

登录后，点击左侧的“Workers和Pages”

![image](https://github.com/jianchang512/translate-api/assets/3378335/1214e761-448b-4605-beab-42cfda4116e7)


然后点击“创建”

![image](https://github.com/jianchang512/translate-api/assets/3378335/da475429-7667-4057-86d6-c290023f21cb)


在打开的新页面中，点击右侧“AI”，找到“Translation App”，鼠标放上去，点击

![image](https://github.com/jianchang512/translate-api/assets/3378335/3dcaf42d-024a-49fb-beec-8d625ffb9a86)

在下一个界面中，设定一个名称， 这个名称将是分配给你的域名的一部分，只允许使用 数字、英文、下划线、中横线组成，如下图，然后保存 -- 完成


![image](https://github.com/jianchang512/translate-api/assets/3378335/34234daf-33b4-4d54-858d-fcc70714670e)



接下来就会告诉你部署成功了，不过还需要粘贴代码去替换默认的。

![image](https://github.com/jianchang512/translate-api/assets/3378335/bf7eb7fa-ad63-4862-97a5-1435ce417224)

## 3. 复制粘贴代码

点击上一步最后显示的“编辑代码”，等待页面显示，然后删掉左侧所有的代码，并粘贴以下代码到左侧,其中的 `123456`是你的访问密钥，可以修改下，防止它人使用浪费你的免费流量。

```
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
    const inputs = {
      text: text,
      source_lang: source_language.substr(0,2),
      target_lang: target_language.substr(0,2),
    };
    const response = await env.AI.run('@cf/meta/m2m100-1.2b', inputs);

    if(response.translated_text.indexOf('ERROR')===0){
      return Response.json({code:2,msg:"ok",text:response.translated_text});
    }
    return Response.json({code:0,msg:"ok",text:response.translated_text });

  },
};


```
![image](https://github.com/jianchang512/translate-api/assets/3378335/754ad922-09e9-49bc-9666-128390fe758c)

粘贴后，等待右上角“保存并部署”可点击后，点击它，然后弹出的确认窗口中，再次确认并部署

![image](https://github.com/jianchang512/translate-api/assets/3378335/12e4482c-9a48-4275-ad44-3168501f760e)

好了，可以愉快的使用了，比如我部署后的地址是 `https://my-translate-api.2124455076.workers.dev/`，那么我直接通过这个地址就可使用

`https://my-translate-api.2124455076.workers.dev/?text=%E4%BD%A0%E5%A5%BD%E5%95%8A%E6%88%91%E7%9A%84%E6%9C%8B%E5%8F%8B&source_language=zh&target_language=en&secret=123456`

![image](https://github.com/jianchang512/translate-api/assets/3378335/92f06ac3-0651-4300-a452-49ec5b6fd6fe)
 
这个地址就是你的翻译API接口地址。

## 4. 绑定自己的域名

如果觉得这个地址太长不好，或者有可能workers.dev 被墙，国内无法访问，而又不想挂代理，可以绑定自己的域名。

首先你需要把你的域名NS服务器修改为cloudflare的，等待生效后，回到cloudflare首页 https://dash.cloudflare.com/ ，绑定你的域名

| NS | ezra.ns.cloudflare.com   |
| -- | ------------------------ |
| NS | karsyn.ns.cloudflare.com |

![image](https://github.com/jianchang512/translate-api/assets/3378335/d8f9e0d7-d9b1-4cb7-8bd8-6dbe24e3ab14)

添加完后，再回到你的worker里，还记得怎么进入吗，点击左侧的“Workers和Pages”

![image](https://github.com/jianchang512/translate-api/assets/3378335/cd334d2f-4ce5-445a-9d7f-6b2065d9c6cc)

右侧就会看到你已创建好的服务，点击它的名称，进入设置页面

![image](https://github.com/jianchang512/translate-api/assets/3378335/856f5464-c0d3-4e3d-8d7d-290f70f80275)
 

如下图所示，先点击 "设置-->触发器"，再点击 "添加自定义域"，就可以添加自己的域名了，比如你已绑定到 cloudflare的域名是 abc.com，那么这里可以设定 api.abc.com,

![image](https://github.com/jianchang512/translate-api/assets/3378335/c197ef89-e2c0-49c0-85af-53aa57b64ae1)

好了，现在可以使用自己的域名访问了

![image](https://github.com/jianchang512/translate-api/assets/3378335/54fbcdba-15fd-4026-b3eb-e96396de9eb4)


## 5. 在代码和软件中使用这个api

首先要记下 m2m100可以支持的语言代码


>
> 阿非利卡语（af）、阿姆哈拉语（am）、阿拉伯语（ar）、阿斯图里亚斯语（ast）、阿塞拜疆语（az）、巴什基尔语（ba）、白俄罗斯语（be）、
> 保加利亚语（bg）、孟加拉语（bn）、布列塔尼语（br）、波斯尼亚语（bs）、加泰罗尼亚语（ca）、宿务语（ceb）、捷克语（cs）、威尔士语（cy）、
> 丹麦语（da）、德语（de）、希腊语（el）、英语（en）、西班牙语（es）、爱沙尼亚语（et）、波斯语（fa）、富拉语（ff）、芬兰语（fi）、
> 法语（fr）、西弗里西亚语（fy）、爱尔兰语（ga）、苏格兰盖尔语（gd）、加利西亚语（gl）、古吉拉特语（gu）、豪萨语（ha）、希伯来语（he）、
> 印地语（hi）、克罗地亚语（hr）、海地克里奥尔语（ht）、匈牙利语（hu）、亚美尼亚语（hy）、印度尼西亚语（id）、伊博语（ig）、
> 伊洛卡诺语（ilo）、冰岛语（is）、意大利语（it）、日语（ja）、爪哇语（jv）、格鲁吉亚语（ka）、哈萨克语（kk）、中央高棉语（km）、
> 卡纳达语（kn）、韩语（ko）、卢森堡语（lb）、甘达语（lg）、林加拉语（ln）、老挝语（lo）、立陶宛语（lt）、拉脱维亚语（lv）、
> 马达加斯加语（mg）、马其顿语（mk）、马拉雅拉姆语（ml）、蒙古语（mn）、马拉地语（mr）、马来语（ms）、缅甸语（my）、尼泊尔语（ne）、
> 荷兰语（nl）、挪威语（no）、北索托语（ns）、奥克西塔尼语（oc），奥里亚语（or）、旁遮普语（pa）、波兰语（pl）、普什图语（ps）、
> 葡萄牙语（pt）、罗马尼亚语（ro）、俄语（ru）、信德语（sd）、僧伽罗语（si）、斯洛伐克语（sk）、斯洛文尼亚语（sl）、索马里语（so）、
> 阿尔巴尼亚语（sq）、塞尔维亚语（sr）、斯瓦蒂语（ss）、巽他语（su）、瑞典语（sv）、斯瓦希里语（sw）、泰米尔语（ta）、泰语（th）、
> 他加禄语（tl）、茨瓦纳语（tn）、土耳其语（tr）、乌克兰语（uk）、乌尔都语（ur）、乌兹别克语（uz）、越南语（vi）、沃洛夫语（wo）、
> 科萨语（xh）、依地语（yi）、约鲁巴语（yo）、中文（zh）、祖鲁语（zu）
> 


**使用python代码使用这个api**


```
import requests
response = requests.get(url="https://transapi.pyvideotrans.com/?text=你好啊我的朋友们&source_language=zh&target_language=en&secret=123456")

print(response.json())


```

![image](https://github.com/jianchang512/translate-api/assets/3378335/4c0d811b-0c4a-45dc-b246-3d2dfbaab772)

就这么简单

**在视频翻译软件中使用**

打开左上角设置菜单--自定义翻译API，填写你的api地址和密钥，然后测试下


![image](https://github.com/jianchang512/translate-api/assets/3378335/84c970be-b1ca-4312-8ee8-ef3a8980620b)

没问题后，翻译渠道里选择“TransAPI” 就可以愉快的使用免费api、免费服务资源翻译你的视频了，免费额度一般每月也足够使用了。

![image](https://github.com/jianchang512/translate-api/assets/3378335/5f630643-15cb-4f93-a621-47b3f331d4d1)

**再次感谢网络菩萨。**

