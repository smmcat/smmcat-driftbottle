import { Context, Schema, Session, h } from 'koishi'
import { } from 'koishi-plugin-smmcat-localstorage'
import { } from 'koishi-plugin-puppeteer'
import { Readable } from 'node:stream'
import { createHTML } from './html'
import crypto from 'crypto'
import { pathToFileURL } from 'url'
import path from 'path'
import fs from 'fs'

export const name = 'smmcat-driftbottle'

export interface Config {
  botId: string,
  adminQQ: Array<string>
  basePath: string
  dataPath: string
  deBug: boolean
  historyPath: string
  throwWaitTime: number
  scoopWaitTime: number
  leaveMsgWaitTime: number
  isExamine: boolean
  Appid: string
  key: string
  styleType: any
  filter: Array<string>
  textfilter: Array<string>
}

export const inject = ['localstorage', 'puppeteer']
export const usage = `
漂流瓶业务，需要安装 [localstorage](/market?keyword=smmcat-localstorage) 服务，作为数据的存储策略

若你需要腾讯不良内容审核业务，请 [加群申请](https://qm.qq.com/q/YpjTRzg3M4) appid
`

export const Config: Schema<Config> = Schema.object({
  botId: Schema.string().description('qqbot的id (由于不会写自动获取需要手动，后续版本自动)'),
  adminQQ: Schema.array(String).role('table').description('管理员QQ 可查指定id内容，删除瓶子'),
  styleType: Schema.union([
    Schema.const(0).description('记事本'),
    Schema.const(1).description('蓝色简约'),
  ]).description('漂流瓶显示风格'),
  basePath: Schema.string().default('./data/smm-driftbottle').description('多媒体文件存放位置'),
  dataPath: Schema.string().default('smm-driftbottle').description('用户数据命名空间 (在 /data/localstorage 文件夹下)'),
  historyPath: Schema.string().default('smm-driftbottle-history').description('用户获得瓶子的数据命名空间 (在 /data/localstorage 文件夹下)'),
  throwWaitTime: Schema.number().default(20000).description('扔漂流瓶的等待时间'),
  scoopWaitTime: Schema.number().default(20000).description('捞漂流瓶的等待时间'),
  leaveMsgWaitTime: Schema.number().default(20000).description('留言的等待时间'),
  deBug: Schema.boolean().default(false).description('日志查看信息'),
  isExamine: Schema.boolean().default(false).description('是否开启不良内容审核'),
  Appid: Schema.string().description('不良内容审核的 appid'),
  key: Schema.string().description('不良内容审核的 密钥'),
  filter: Schema.array(String).role('table').default([
    "ACGPorn",
    'ButtocksExposed',
    "WomenSexyChest",
    'WomenSexy',
    'ACGSexy',
    "SexualGoods",
    "Porn",
    "PornSum",
    "Sexy"
  ]).description('图像要检测的词条'),
  textfilter: Schema.array(String).role("table").default([
    "Abuse",
    "Illegal",
    "Spam",
    "Terror",
    "Porn",
    "Polity",
    "Ad"
  ]).description("文本要检测的词条")
})

export function apply(ctx: Context, config: Config) {
  /** 漂流瓶内容 */
  type DiftContent = {
    /** 创建时间 */
    creatTime: number,
    /** 文本 */
    text: string | null,
    /** 图片 */
    image: string[] | null,
    /** 发送者 */
    userId?: string
  }

  /** 漂流瓶信息 */
  type DiftInfo = {
    /** 瓶子编号 */
    id: number,
    /** 样式风格 */
    style: number,
    /** 内容 */
    content: DiftContent & {
      /** 音频 */
      audio: string[] | null,
      /** 标题 */
      title: string | null,
    },
    /** 被捞次数 */
    getCount: number,
    /** 允许显示 */
    show: boolean,
    /** 发送者 */
    userId: string,
    /** 评论 */
    review: DiftContent[]
  }


  /** 下载工具集合 */
  const downloadUilts = {
    /** 基地址 */
    basePath: path.join(ctx.baseDir, config.basePath),
    /** 下载音频到本地 */
    async setStoreForAudio(audioUrl: string, type = 'silk'): Promise<string | null> {
      const setPath = path.join(this.basePath, './audio')
      if (!fs.existsSync(setPath)) {
        fs.mkdirSync(setPath, { recursive: true });
      }
      const timestamp = new Date().getTime();
      const audioPath = path.join(setPath, `${timestamp}.${type}`);
      const response = await ctx.http.get(audioUrl, { responseType: 'stream' });
      const writer = fs.createWriteStream(audioPath);
      const responseNodeStream = Readable.fromWeb(response)
      responseNodeStream.pipe(writer);

      return await new Promise((resolve, reject) => {
        writer.on('finish', () => {
          config.deBug && console.log(`下载完成，文件路径 ${audioPath}`);
          resolve(pathToFileURL(audioPath).href)
        });
        writer.on('error', () => {
          reject(null)
        });
      });
    },
    /** 下载图片到本地 */
    async setStoreForImage(imageUrl: string, type = 'jpg'): Promise<string | null> {
      const setPath = path.join(this.basePath, './image')
      if (!fs.existsSync(setPath)) {
        fs.mkdirSync(setPath, { recursive: true });
      }
      const timestamp = new Date().getTime();
      const imagePath = path.join(setPath, `${timestamp}.${type}`);
      const response = await ctx.http.get(imageUrl, { responseType: 'stream' });
      const writer = fs.createWriteStream(imagePath);
      const responseNodeStream = Readable.fromWeb(response)
      responseNodeStream.pipe(writer);

      return await new Promise((resolve, reject) => {
        writer.on('finish', () => {
          config.deBug && console.log(`下载完成，文件路径 ${imagePath}`);
          resolve(pathToFileURL(imagePath).href)
        });
        writer.on('error', () => {
          reject(null)
        });
      });
    }
  }

  const tools = {
    sanitizeText(input) {
      // 清除 <script> 标签及其内容
      const scriptRemoved = input?.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
      // 清除所有其他 HTML 标签
      const cleanText = scriptRemoved?.replace(/<[^>]*>/g, '');
      return cleanText?.trim(); // 去除首尾空格
    }
  }

  enum UseType {
    /** 扔瓶子 */
    RenPingZi = 0,
    /** 捞瓶子 */
    LaoPingZi = 1,
    /** 留言 */
    LiuYan = 2
  }
  const timeList = [config.throwWaitTime, config.scoopWaitTime, config.leaveMsgWaitTime]
  // 指令冷却
  const cooling = {
    userIdList: {},
    check(userId: string, type: UseType) {
      if (!this.userIdList[userId]) {
        this.userIdList[userId] = { 0: 0, 1: 0, 2: 0 }
      }
      const now = +new Date()
      if (now - this.userIdList[userId][type] < timeList[type]) {
        return false
      } else {
        this.userIdList[userId][type] = now
        return true
      }
    }
  }

  /** 漂流瓶操作 */
  const driftbottle = {
    /** 基地址 */
    basePath: '',
    /** 历史记录存放基地址 */
    historyPath: '',
    /** id参考 用户递增 */
    nextId: 0,
    /** 用户数据 */
    userTempList: {},
    /** 用户获得瓶子历史记录 */
    historyTempList: {},
    /** 内容初始化 */
    async init() {
      this.basePath = path.join(ctx.localstorage.basePath, config.dataPath)
      this.historyPath = path.join(ctx.localstorage.basePath, config.historyPath)

      if (!fs.existsSync(this.basePath)) {
        fs.mkdirSync(this.basePath, { recursive: true });
      }
      if (!fs.existsSync(this.historyPath)) {
        fs.mkdirSync(this.historyPath, { recursive: true });
      }
      const dict = { data: { ok: 0, err: 0 }, history: { ok: 0, err: 0 } }
      const temp: { [key: string]: DiftInfo[] } = {}
      const historyTemp = {}
      const eventList = fs.readdirSync(this.basePath).map((item: string) => {
        return new Promise(async (reslove, rejects) => {
          try {
            temp[item] = JSON.parse(await ctx.localstorage.getItem(`${config.dataPath}/${item}`))
            dict.data.ok++
            reslove(true)
          } catch (error) {
            dict.data.err++
            config.deBug && console.log(error);
            reslove(true)
          }
        })
      })
      const historyEventList = fs.readdirSync(this.historyPath).map((item: string) => {
        return new Promise(async (reslove, rejects) => {
          try {
            historyTemp[item] = JSON.parse(await ctx.localstorage.getItem(`${config.historyPath}/${item}`))
            dict.data.ok++
            reslove(true)
          } catch (error) {
            dict.data.err++
            config.deBug && console.log(error);
            reslove(true)
          }
        })
      })
      await Promise.all(eventList)
      config.deBug && console.log(`漂流瓶数据加载完成，一共加载成功${dict.data.ok}个用户数据，失败:${dict.data.err}个`);
      await Promise.all(historyEventList)
      config.deBug && console.log(`历史数据加载完成，一共加载成功${dict.history.ok}个用户数据，失败:${dict.history.err}个`);
      config.deBug && console.log(JSON.stringify(temp, null, ' '));

      // 找到最后一个 id
      this.nextId = [].concat(...Object.values(temp)).map((item) => item.id).sort((a, b) => b - a)[0] || 0
      this.userTempList = temp
      this.historyTempList = historyTemp
      console.log(this.historyTempList);

    },
    /** 评论指定 id 的瓶子内容 */
    async setReviewForCententById(session: Session, id: number, msg: string) {

      if (!this.historyTempList[session.userId]) {
        this.historyTempList[session.userId] = []
        this.updateStoreHistory(session.userId)
      }
      if (!this.historyTempList[session.userId].includes(id) && !config.adminQQ.includes(session.userId)) {
        return `您并未捞到过 id 为：${id} 的瓶子，需要捞到过才可以指定选择读取瓶子内容`
      }

      const allContent: DiftInfo[] = [].concat(...Object.values(this.userTempList))
      const selectContent: DiftInfo = allContent.find((item) => item.id == id)
      if (!selectContent) {
        return `查找失败，没有找到对应id为 ${id} 的瓶子`
      }
      if (!selectContent.show) {
        return `id为 ${id} 的瓶子已被管理员清理...`
      }
      if (selectContent.content.audio !== null) {
        return "无法对语音瓶进行留言，留言操作失败！"
      }

      let text = h.select(msg, 'text').length ? h.select(msg, 'text')[0].attrs.content.trim() : null
      let imageUrl = h.select(msg, 'img').length ? h.select(msg, 'img').map((item) => item.attrs.src) : null

      // 不良内容安全验证
      if (imageUrl && imageUrl.length) {
        imageUrl = await delSetu.checkImg(session, imageUrl)
      }
      if (text) {
        text = await delSetu.checkText(text)
      }

      if (!text?.trim() && !imageUrl) {
        return `请填写内容，不能发送空内容作为留言发送！`
      }

      let storeImageUrl = []
      const dict = { img: { ok: 0, err: 0 } }

      // 存储图片到本地
      if (imageUrl) {
        const eventList = imageUrl.map((item: string) => {
          return new Promise(async (resolve, rejects) => {
            try {
              const upath = await downloadUilts.setStoreForImage(item)
              config.deBug && console.log(upath);
              storeImageUrl.push(upath)
              dict.img.ok++
              resolve(true)
            } catch (error) {
              console.log(error);
              dict.img.err++
              resolve(true)
            }
          })
        })
        await Promise.all(eventList)
        config.deBug && console.log(`图片数据保存本地完成，一共加载成功:${dict.img.ok}个，失败:${dict.img.err}个`);
      }
      const temp: DiftContent = {
        creatTime: +new Date(),
        text: tools.sanitizeText(text),
        userId: session.userId,
        image: storeImageUrl.length ? storeImageUrl : null
      }
      selectContent.review.push(temp)
      await session.send(`评论id:${id} 的` + this.driftbottleType(selectContent) + '成功！')
    },
    /** 封禁漂流瓶 */
    async closeCententById(session: Session, id: number) {
      if (!config.adminQQ.includes(session.userId)) {
        return `您并未管理员，无权操作...`
      }

      const allContent: DiftInfo[] = [].concat(...Object.values(this.userTempList))
      const selectContent: DiftInfo = allContent.find((item) => item.id == id)
      if (!selectContent) {
        return `查找失败，没有找到对应id为 ${id} 的瓶子`
      }
      if (!selectContent.show) {
        return `id为 ${id} 目前的状态已经是关闭显示的状态，无需再次关闭`
      }

      selectContent.show = false
      this.updateStoreUser(selectContent.userId)
      await session.send(`处理成功，已关闭显示 id:${id} 的` + this.driftbottleType(selectContent))
    },
    /** 解封漂流瓶 */
    async openCententById(session: Session, id: number) {
      if (!config.adminQQ.includes(session.userId)) {
        return `您并未管理员，无权操作...`
      }

      const allContent: DiftInfo[] = [].concat(...Object.values(this.userTempList))
      const selectContent: DiftInfo = allContent.find((item) => item.id == id)
      if (!selectContent) {
        return `查找失败，没有找到对应id为 ${id} 的瓶子`
      }
      if (selectContent.show) {
        return `id为 ${id} 目前的状态已经是开放显示的状态，无需再次开放`
      }

      selectContent.show = true
      this.updateStoreUser(selectContent.userId)
      await session.send(`处理成功，已开放显示 id:${id} 的` + this.driftbottleType(selectContent))
    },
    /** 将返回的消息记录成瓶子收录格式 */
    async getContentMakeRecords(session: Session, content: string, title = null) {
      const userId = session.userId
      // 收集
      const audioList = h.select(content, 'audio')
      const imageList = h.select(content, 'img')
      // 过滤
      let audioUrl = audioList.length ? audioList.map((item) => item.attrs.src) : null
      let imageUrl = imageList.length ? imageList.map((item) => item.attrs.src) : null
      let text = h.select(content, 'text')[0]?.attrs.content.trim() || null

      if (![audioUrl, imageUrl, text].some(item => item !== null)) {
        return { code: false, msg: `瓶子没有内容是不允许丢出的噢~ 请为瓶子填写内容。\n可以为 文本+图片 或者 音频` }
      }

      // 不良内容安全验证
      if (imageUrl && imageUrl.length) {
        imageUrl = await delSetu.checkImg(session, imageUrl)
      }
      if (text) {
        text = await delSetu.checkText(text)
      }

      let storeAudioUrl = []
      let storeImageUrl = []
      const dict = { img: { ok: 0, err: 0 }, audio: { ok: 0, err: 0 } }
      // 存储音频到本地
      if (audioUrl) {
        const eventList = audioUrl.map((item: string) => {
          return new Promise(async (resolve, rejects) => {
            try {
              const upath = await downloadUilts.setStoreForAudio(item)
              config.deBug && console.log(upath);
              storeAudioUrl.push(upath)
              dict.audio.ok++
              resolve(true)
            } catch (error) {
              console.log(error);
              dict.audio.err++
              resolve(true)
            }
          })
        })
        await Promise.all(eventList)
        config.deBug && console.log(`音频数据保存本地完成，一共加载成功:${dict.audio.ok}个，失败:${dict.audio.err}个`);
      }
      // 存储图片到本地
      if (imageUrl) {
        const eventList = imageUrl.map((item: string) => {
          return new Promise(async (resolve, rejects) => {
            try {
              const upath = await downloadUilts.setStoreForImage(item)
              config.deBug && console.log(upath);
              storeImageUrl.push(upath)
              dict.img.ok++
              resolve(true)
            } catch (error) {
              console.log(error);
              dict.img.err++
              resolve(true)
            }
          })
        })
        await Promise.all(eventList)
        config.deBug && console.log(`图片数据保存本地完成，一共加载成功:${dict.img.ok}个，失败:${dict.img.err}个`);
      }

      // 为瓶子赋予 id
      const id = ++this.nextId
      // 撰写信息对象
      const temp: DiftInfo = {
        id,
        getCount: 0,
        content: {
          creatTime: +new Date(),
          text: tools.sanitizeText(text),
          title: tools.sanitizeText(title),
          image: storeImageUrl.length ? storeImageUrl : null,
          audio: storeAudioUrl.length ? storeAudioUrl : null,
          userId
        },
        show: true,
        userId,
        style: 0,
        review: []
      }

      if (!this.userTempList[userId]) {
        this.userTempList[userId] = []
      }
      this.userTempList[userId].push(temp)
      this.updateStoreUser(userId)
      this.historyGetContentId(userId, id)
      config.deBug && console.log(JSON.stringify(temp, null, ' '));
      return { code: true, msg: `你成功扔出了一个${this.driftbottleType(temp)}\n瓶子ID为：${id}` }
    },
    /** 获得随机瓶子 */
    async randomGetDriftContent(session) {
      const allContent: DiftInfo[] = [].concat(...Object.values(this.userTempList)).filter((item: DiftInfo) => item.show)
      const id = Math.round(Math.random() * (allContent.length - 1))
      console.log(allContent.length, id);

      const randomContent: DiftInfo = allContent[id]
      console.log(randomContent);
      await session.send(`你捞到一个` + this.driftbottleType(randomContent) + '\n稍等，正在为你展开内容...')
      randomContent.getCount++
      // 记录获得的瓶子
      this.historyGetContentId(session.userId, randomContent.id)
      this.updateStoreUser(randomContent.userId)
      return await this.formatDriftContent(randomContent)
    },
    /** 存储得到的瓶子记录 */
    async historyGetContentId(userId: string, id: number) {
      if (!this.historyTempList[userId]) {
        this.historyTempList[userId] = []
      }
      if (!this.historyTempList[userId].includes(id)) {
        this.historyTempList[userId].push(id)
        await this.updateStoreHistory(userId)
      }
    },
    /** 获得指定瓶子 */
    async GetDriftContentById(session: Session, id: number) {

      if (!this.historyTempList[session.userId]) {
        this.historyTempList[session.userId] = []
        this.updateStoreHistory(session.userId)
      }
      if (!this.historyTempList[session.userId].includes(id) && !config.adminQQ.includes(session.userId)) {
        return `您并未捞到过 id 为：${id} 的瓶子，需要捞到过才可以指定选择读取瓶子内容`
      }

      const allContent: DiftInfo[] = [].concat(...Object.values(this.userTempList))
      const selectContent: DiftInfo = allContent.find((item) => item.id == id)
      if (!selectContent) {
        return `查找失败，没有找到对应id为 ${id} 的瓶子`
      }
      if (!selectContent.show) {
        return `id为 ${id} 的瓶子已被管理员清理...`
      }
      console.log(selectContent);
      await session.send(`指定获取id为${id}的` + this.driftbottleType(selectContent) + '\n稍等，正在为你展开内容...')
      selectContent.getCount++
      this.updateStoreUser(selectContent.userId)
      return await this.formatDriftContent(selectContent)
    },
    /** 格式化瓶子内容 */
    async formatDriftContent(temp: DiftInfo) {
      if (!temp.content.audio?.length) {
        const htmlstr = createHTML.driftContent(temp, config.styleType, config.botId)
        return await ctx.puppeteer.render(htmlstr) + `你可以发送 /留言 ${temp.id} 你的内容 \n来在这个瓶子中发表自己的意见`
      } else {
        return `你捞到了id:${temp.id} 的语音瓶，${temp.content.title ? `标题为：${temp.content.title}。\n` : ''}内容如下：` + h.audio(temp.content.audio[0])
      }
    },
    /** 漂流瓶统计 */
    driftbottleTatistics(session) {
      const allContent: DiftInfo[] = [].concat(...Object.values(this.userTempList))


      const hiddenContent: DiftInfo[] = [] // 封禁的瓶子
      const lostContent: DiftInfo[] = [] // 没捞过的瓶子
      const myContent: DiftInfo[] = [] // 我发布的瓶子
      const reviewContent: DiftInfo[] = [] // 我评论过的瓶子
      const typeList: string[] = []

      // 统计队列
      let reviewTotal = allContent.map((item) => {
        if (!item.show) {
          hiddenContent.push(item)
        }
        if (item.getCount === 0) {
          lostContent.push(item)
        }
        if (item.userId === session.userId) {
          myContent.push(item)
        }
        if (item.review.some((i) => i.userId === session.userId)) {
          reviewContent.push(item)
        }
        typeList.push(driftbottle.driftbottleType(item))
        return item.review.length
      }).reduce((a, b) => a + b, 0)

      const typeKey = {}
      typeList.forEach((item) => {
        if (!typeKey[item]) {
          typeKey[item] = 0
        }
        typeKey[item]++
      })

      const msg =
        h.image('https://smmcat.cn/run/plp.jpg') + `截至到现在的数据如下:` +
        `\n\n【海的数据】\n` +
        `茫茫大海中已经存在有${allContent.length}个漂流瓶...` +
        (hiddenContent.length ? `\n不过有${hiddenContent.length}个瓶子已经被沉入海底，不能获取。` : '')
        + (lostContent.length ? `\n有${lostContent.length}从未被捞到过...` : '') +
        `\n\n【瓶子数据】\n` +
        Object.keys(typeKey).map((item) => {
          return `${item}存在${typeKey[item]}个;`
        }).join('\n') +
        (reviewTotal ? `\n有${reviewTotal}条评论数据;` : '\n还没有任何评论内容;')
        + `\n\n【我的数据】\n` +
        (myContent.length ? `至此，你已经丢过${myContent.length}个漂流瓶。\n` : '至此，你还没扔过任何一个漂流瓶。\n') +
        (reviewContent.length ? `你一共评论过${reviewContent.length}个漂流瓶\n` : '你却也还没评论过任何一个漂流瓶。')

      return msg
    },
    /** 瓶子类型判断 */
    driftbottleType(temp: DiftInfo) {
      const audioUrl = temp.content.audio
      const imageUrl = temp.content.image
      const text = temp.content.text
      return audioUrl ? "语音瓶" : imageUrl && text ? "图文瓶" : imageUrl ? "图片瓶" : "文本瓶"
    },
    /** 持久化单用户数据 */
    async updateStoreUser(userId: string) {
      const temp = this.userTempList[userId]
      await ctx.localstorage.setItem(`${config.dataPath}/${userId}`, JSON.stringify(temp))
    },
    /** 持久化单用户数据 */
    async updateStoreHistory(userId: string) {
      const temp = this.historyTempList[userId]
      await ctx.localstorage.setItem(`${config.historyPath}/${userId}`, JSON.stringify(temp))
    }
  }

  // 不良内容识别
  const delSetu = {
    // 生成签名
    getSignature() {
      function generateHmacSha256(key2, data) {
        const hmac = crypto.createHmac("sha256", key2);
        hmac.update(data);
        const hash = hmac.digest("hex");
        return hash;
      }
      const apiId = config.Appid;
      const key = config.key;
      const time = Math.floor(+new Date() / 1e3);
      const queryKey = {
        "Api-Appid": apiId,
        "Api-Nonce-Str": "123456",
        "Api-Timestamp": time,
        "key": key
      };
      const ascllSortMap = Object.keys(queryKey).sort();
      const strKey = ascllSortMap.map((item) => {
        return `${item}=${queryKey[item]}`;
      }).join("&");
      console.log(strKey);
      const keyData = generateHmacSha256(key, strKey).toUpperCase();
      return {
        "Api-Appid": apiId,
        "Api-Nonce-Str": "123456",
        "Api-Timestamp": time,
        "Api-Sign": keyData
      };
    },
    async checkImg(session: Session, imgList: string[]) {
      if (config.isExamine && config.Appid && config.key) {
        const dict = { err: 0 };
        const eventList = imgList.map((item, index) => {
          return new Promise(async (resolve, reject) => {
            try {
              const md5 = await tool.getPicMd5(item)
              let result2 = null
              if (!tool.checkPicRepeatDyMD5(md5)) {
                result2 = await ctx.http.post(`https://tools.mgtv100.com/external/v1/qcloud_content_audit`, {
                  audit_type: "image",
                  audit_content: item
                }, {
                  headers: delSetu.getSignature()
                });
                tool.putPicMd5TempData(md5, result2)
              } else {
                result2 = tool.md5temp[md5]
              }
              if (result2.code == 200 && result2.data?.LabelResults) {
                const flag = result2.data.LabelResults.every((item2) => {
                  if (config.filter.includes(item2.Scene) && item2.Suggestion !== "Pass") {
                    return false;
                  } else {
                    return true;
                  }
                });
                if (!flag) {
                  dict.err++;
                  imgList[index] = null;
                }
              } else {
                console.log("不良图像审核处理失败，检测 key 是否失效或者有效。或 key 的次数用完");
              }
              resolve(true);

            } catch (error) {
              console.log(error);
              resolve(true);
            }
          });
        });
        await Promise.all(eventList);
        if (dict.err) {
          await session.send(`存在${dict.err}张不良图片，提交前已过滤`);
        }
        return imgList.filter((item) => item !== null);
      } else {
        return imgList
      }
    },
    async checkText(msg: String) {
      if (config.isExamine && config.Appid && config.key) {
        try {
          const result2 = await ctx.http.post(`https://tools.mgtv100.com/external/v1/qcloud_content_audit`, {
            audit_type: "text",
            audit_content: msg
          }, {
            headers: delSetu.getSignature()
          });
          if (result2.code == 200 && result2.data?.DetailResults) {
            result2.data.DetailResults.forEach((item) => {
              if (config.textfilter.includes(item.Label) && item.Suggestion !== "Pass") {
                item.Keywords.forEach((text) => {
                  msg = msg.replace(new RegExp(text, "g"), "***");
                });
              }
            });
          } else {
            console.log("不良文本审核处理失败，检测 key 是否失效或者有效。或 key 的次数用完");
          }
          return msg
        } catch (error) {
          console.log(error);
          return msg
        }
      } else {
        return msg
      }
    }
  }

  // md5 优化
  const tool = {
    md5temp: {},
    md5Len: [],
    async getPicMd5(imageUrl) {
      const response = await ctx.http.get(imageUrl, { responseType: "arraybuffer" });
      const hash = crypto.createHash("md5");
      const buffer = hash.update(Buffer.from(response));
      return buffer.digest("hex");
    },
    // 校验图片是否存在MD5缓存
    checkPicRepeatDyMD5(md5Data) {
      if (this.md5temp[md5Data]) {
        config.deBug && console.log("存在重复图片 返回缓存");
        return this.md5temp[md5Data];
      }
      return null;
    },
    // 将返回的结果存进MD5缓存
    putPicMd5TempData(md5Data, result) {
      if (!this.md5temp[md5Data]) {
        config.deBug && console.log("新图 开始存入缓存");
        this.md5temp[md5Data] = result;
        this.md5Len.push(md5Data)
        this.tempFullToDelect();
        config.deBug && console.log("新图 完成存入缓存");
      }
    },
    // 超过约束的数量自动清理
    tempFullToDelect() {
      if (this.md5Len.length > 300) {
        config.deBug && console.log("缓存超过约束长度，执行清理");
        const delMd5 = this.md5Len.shift();
        delete this.md5temp[delMd5];
      }
    }
  };


  ctx.on('ready', () => {
    driftbottle.init()
  })

  ctx
    .command('漂流瓶')

  ctx
    .command('漂流瓶/捞漂流瓶 <num:number>')
    .action(async ({ session }, num) => {
      if (!cooling.check(session.userId, UseType.LaoPingZi)) {
        return `你捞瓶子的频率太快，请等20秒`
      }
      num = num && Math.abs(Math.floor(num))
      if (num) {
        return await driftbottle.GetDriftContentById(session, num)
      } else {
        return await driftbottle.randomGetDriftContent(session)
      }
    })

  ctx
    .command('漂流瓶/留言 <pid:number> <msg:text>')
    .action(async ({ session }, pid, msg) => {
      if (!cooling.check(session.userId, UseType.LiuYan)) {
        return `你留言的频率太快，请等20秒`
      }
      if (pid == undefined) {
        return `发送失败，请先填写需要留言的漂流瓶的对应 id\n例如：留言 1 这是内容`
      }
      pid = Math.abs(Math.floor(pid))
      return await driftbottle.setReviewForCententById(session, pid, msg)
    })

  ctx
    .command('漂流瓶/扔漂流瓶')
    .action(async ({ session }) => {
      if (!cooling.check(session.userId, UseType.RenPingZi)) {
        return `你扔瓶子的频率太快，请等20秒`
      }
      await session.send('(*/ω＼*) 您正在尝试丢出一个瓶子，请在20秒内发送你瓶子里的内容。')
      let res = await session.prompt(20000)
      if (res && res.trim()) {
        // 判断是否需要添加图片内容
        if (h.select(res, 'aduio').length == 0 && h.select(res, 'img').length == 0) {
          await session.send('(￣y▽￣)╭ 似乎没有携带图片，这对其他用户可能阅读上有些单调；需要为漂流瓶配图吗？请在10秒内发送图片作为补充内容\n不需要则发：否')
          let imgTemp = await session.prompt(10000)
          let imgList = imgTemp ? h.select(imgTemp, 'img').map((item) => h.image(item.attrs.src)) : null
          // 添加图片
          if (imgList?.length) {
            res += imgList
          } else {
            if (imgTemp !== undefined && imgTemp.trim() !== "否") {
              await session.send('(；′⌒`) 啊...没检测到图片，图片上传失败')
            }
          }
        }
        await session.send('(´▽`ʃ♡ƪ) 是否要为该瓶子起一个标题？请在10秒内发送，不需要则发：否')
        let title = await session.prompt(20000)
        if (title && title.trim() !== '否') {
          title = h.select(title, 'text')[0]?.attrs.content
          const result = await driftbottle.getContentMakeRecords(session, res, title);
          await session.send(result.msg)
          return
        }
        const result = await driftbottle.getContentMakeRecords(session, res);
        await session.send(result.msg)
      }
    })

  ctx
    .command('漂流瓶/封漂流瓶 <pid:number>')
    .action(async ({ session }, pid) => {
      if (pid == undefined) {
        return `确认你是否携带id参数`
      }
      pid = Math.abs(Math.floor(pid))
      return await driftbottle.closeCententById(session, pid)
    })

  ctx
    .command('漂流瓶/解漂流瓶 <pid:number>')
    .action(async ({ session }, pid) => {
      if (pid == undefined) {
        return `确认你是否携带id参数`
      }
      pid = Math.abs(Math.floor(pid))
      return await driftbottle.openCententById(session, pid)
    })

  ctx
    .command('漂流瓶/漂流瓶统计')
    .action(async ({ session }) => {
      return driftbottle.driftbottleTatistics(session)
    })
}
