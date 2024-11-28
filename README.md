# AutoForward

自用的小插件，可以根据指定规则自动转发消息至指定好友/群的插件。  
现在应该只能转发文字消息。

## 匹配模式
- 消息完全匹配
- 包含关键字
- 指定QQ/群号
- 使用AI判定

### 消息完全匹配  
1. 顾名思义，只有收到的消息完全与设置的内容匹配时才会转发。例如，设置内容为“你好”，只有收到的消息为“你好”时才会触发转发
2. 多个匹配内容可以用英文逗号`,`分隔。当设置了多个匹配内容时，只要有一个内容与收到的消息完全相同时就会转发。

### 包含关键字
1. 当收到的消息中包含设置的关键字时，就会触发转发。例如，设置内容为“你好”，收到的消息“你好帅”就会触发转发。
2. 多个匹配内容可以用英文逗号`,`分隔。当设置了多个匹配内容时，只要收到的消息包含了其中一个关键字就会触发转发。

### 指定QQ/群号
1. 当收到的消息来自指定的QQ/群号时，就会触发转发。例如，设置内容为“123456”，收到的消息来自QQ号为123456的好友时就会触发转发。
2. 多个匹配内容可以用英文逗号`,`分隔。

### 使用AI判定
1. 在匹配规则中输入什么样的内容应该被转发，注意：**一定要明确的表达清楚什么情况下应该转发。**
2. AI使用的是智谱AI的免费API，完全免费，但是需要自己去获取APIKEY。
3. 在智谱APIKEY输入，智谱AI的APIKEY。获取地址：https://open.bigmodel.cn/
4. APIKEY只会保存在你的本地，本插件不会将它上传到任何云端。
5. 出于安全考虑，APIKEY填写之后不会回显，输入框后面会展示文字提示：已设置/未设置。
6. APIKEY获取方式，首先在[智谱大模型官网](https://open.bigmodel.cn/)注册账号并且实名认证，然后去[APIKEY页面](https://open.bigmodel.cn/usercenter/proj-mgmt/apikeys)复制APIKEY


## 转发消息接收人
- 转发到QQ
- 转发到群聊
- 转发到某个群里指定的群员

### 转发到QQ
1. 填写了**接收的QQ**时，当触发转发时，会将消息转发到填写的QQ号。
2. 多个QQ号可以用英文逗号`,`分隔。

### 转发到群聊
1. 填写了**接收的群聊**时，当触发转发时，会将消息转发到填写的群聊。
2. 多个群聊可以用英文逗号`,`分隔。

### 转发到某个群里指定的群员
> 这个方式主要是用作与QQ机器人对话，需要转发消息给QQ机器人可以使用这个。随便找一个有目标机器人的群，然后把群号填上去，再把机器人的QQ号填上去。
1. 填写了**指定群成员**时，，当触发转发时，会将消息转发到该群的指定的群员。
2. 多个群成员可以用英文逗号`,`分隔。
3. **只能填写一个群聊**，但是群成员可以填写多个。

## 消息预处理
- 添加前缀
- 添加后缀

在预处理时使用`{{发送人}}`可获取到发送人QQ号/群号变量。
> 例如收到来自QQ号123456的消息。在**添加前缀**输入：收到来自{{发送人}}的消息。  
> 转发时，消息会变成：收到来自123456的消息。

### 添加前缀
1. 填写了**添加前缀**时，当触发转发时，会在消息的最前面添加填写的内容。

### 添加后缀
1. 填写了**添加后缀**时，当触发转发时，会在消息的最后面添加填写的内容。

## 依赖
- [Euphony](https://github.com/xtaw/LiteLoaderQQNT-Euphony)

## 后续计划（具体做不做随缘 = =）

- ~~利用AI模型判断当前消息是否应该转发。~~ （2024/11/28 已实现）
- 白名单模式-白名单中的发送的所有内容都被转发
- 黑名单模式-黑名单中的发送的所有内容都不转发
- 针对不同发送人将消息转发到不同的好友/群聊
- 针对不同发送人的消息做不同的预处理(添加前缀、后缀)
