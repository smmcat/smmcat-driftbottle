import { Context, Session } from "koishi";
import { Config, DiftInfo } from ".";
import path from 'path'
import fs from 'fs/promises'
import { fileURLToPath } from "url";

type Token = {
    [key: string]: string;
}

export type WebBottleResult = {
    code: number,
    data: WebBottleData
}
export type WebBottleData = {
    id: string,
    content: {
        createTime: number | string,
        text: string,
        title: string,
        image: string[],
        userId: string,
        avatar?: string
    },
    review: {
        createTime: number | string,
        creatTime?: number | string,
        text: string,
        userId: string,
        botId: string,
        platform: string,
        avatar?: string,
        image: []
    }[],
    userId: string,
    botId: string,
    show: boolean,
    getCount: number,
    platform: string
}

export type BottleContent = {
    content: {
        text: string,
        title: string,
        image: string[]
    }
    userId: string
}

export type CommentContent = { text: string, userId: string, platform: string }

export const webBottle = {
    baseUrl: 'http://182.92.130.139:8080',
    ctx: {} as Context,
    config: {} as Config,
    token: {} as Token,
    /** 反馈初始化 */
    async init(ctx: Context, config: Config) {
        this.ctx = ctx
        this.config = config
    },
    /** 获取云端漂流瓶的 Token */
    async getToken(session: Session) {
        try {
            const { platform, botId } = this.getBotInfo(session)
            if (!(platform && botId)) return
            if (!this.token[platform]) this.token[platform] = {}
            if (this.token[platform][botId]) return
            const result = await (this.ctx as Context).http.post(this.baseUrl + '/login', { platform, botId })
            this.token[platform][botId] = result.token
        } catch (error) {
            return
        }
    },
    setToken(session: Session) {
        const { platform, botId } = this.getBotInfo(session)
        if (!(platform && botId)) return
        if (!this.token[platform]) this.token[platform] = {}
        return this.token[platform][botId]
    },
    /** 获取当前使用bot信息 */
    getBotInfo(session: Session) {
        const platform = session.platform
        let botId = ''
        if (platform == 'qq') {
            botId = extractAppId(session.event.user.avatar)
        } else {
            botId = session.event.selfId
        }
        return { platform, botId }
    },
    /** 获取一条漂流瓶数据 */
    async getWebBottleData(session: Session, id?: number) {
        try {
            await this.getToken(session)
            const result: WebBottleResult = await (this.ctx as Context).http.get(
                this.baseUrl + '/random',
                { params: { id }, headers: { 'Authorization': webBottle.setToken(session) } }
            )
            return { code: true, data: addMoreData(result.data) }
        } catch (error) {
            console.log(error.response.data?.msg);
            return { code: false, data: error.response.data?.msg || '打捞失败' }
        }
    },
    /** 扔出一个漂流瓶 */
    async setBottleData(session: Session, content: BottleContent) {
        try {
            await this.getToken(session)
            const result = await (this.ctx as Context).http.post(
                this.baseUrl + '/add', content,
                { headers: { 'Authorization': webBottle.setToken(session), "Content-Type": "application/json; charset=utf-8" } }
            )
            return result.id
        } catch (error) {
            return -1
        }
    },
    /** 对指定瓶子进行评论 */
    async setCommentData(session: Session, id: number, content: CommentContent) {
        try {
            await this.getToken(session)
            const temp = {
                bottleId: id,
                ...content
            }
            const result = await (this.ctx as Context).http.post(
                this.baseUrl + '/comment', temp,
                { headers: { 'Authorization': webBottle.setToken(session), "Content-Type": "application/json; charset=utf-8" } }
            )
            return result.msg
        } catch (error) {
            return error.response.data?.msg
        }
    },
    /** 上传数据到服务器喵 */
    async uploadWebBottleData(session: Session, bottleDataTemp: DiftInfo[]) {
        try {
            // 超超简易安全模块 工作中！
            if (!webBottle.config.adminQQ?.includes(session.userId)) {
                // 防小人提示
                await session.send('您并非 bot管理员，无权操作')
                return
            }
            // 可能需要控制一下用户焦灼的情绪
            await session.send('正在上传，可能需要耗费过多时间，请等待...')
            // 搜集数据中...
            const updatedId = JSON.parse(await (this.ctx as Context).localstorage.getItem(webBottle.config.webFilingPath) || '[]')
            const bottleData = bottleDataTemp.filter(item => !updatedId.includes('' + item.id) || !item.content.audio)
            if (!bottleData.length) {
                await session.send('暂无需要同步上传服务器的最新数据')
                return
            }
            // MD！用户等急了 必须再安慰一下
            await session.send(`已找到新的${bottleData.length}条数据。`)
            // 提交前需证明一下萝莉就是你自己
            await this.getToken(session)
            const upId = []
            const dict = { ok: 0, err: 0 }
            // 啥东西，又要调一次？必须后期优化
            const { platform, botId } = this.getBotInfo(session)
            // 瓶子里又塞二进制文件了，麻烦噎
            for (const bottle of bottleData) {
                try {
                    // 准备爆
                    const base64ImgList = []
                    // 准备给它爆
                    if (Array.isArray(bottle.content?.image) && bottle.content.image.length) {
                        for (const img of bottle.content.image) {
                            const base64 = await fs.readFile(fileURLToPath(img), 'base64')
                            const type = path.extname(fileURLToPath(img))
                            base64ImgList.push({ base64, type })
                        }
                    }
                    // 啥啊，评论区还支持插入图片
                    const reviewList = []
                    // 证明有配图
                    if (Array.isArray(bottle.review) && bottle.review.length) {
                        for (const review of bottle.review) {
                            const review_base64ImgList = []
                            if (Array.isArray(review?.image) && review.image.length) {
                                for (const img of review.image) {
                                    const base64 = await fs.readFile(fileURLToPath(img), 'base64')
                                    const type = path.extname(img)
                                    review_base64ImgList.push({ base64, type })
                                }
                            }
                            reviewList.push({ ...review, platform, botId, image: review_base64ImgList })
                        }
                    }

                    // 按着项目需求的结构去构建提交的资料
                    const temp = {
                        privateId: bottle.id,
                        botId,
                        platform,
                        content: {
                            text: bottle.content?.text || '',
                            title: bottle.content.title || '',
                            userId: bottle.content.userId,
                            platform,
                            image: base64ImgList,
                            botId
                        },
                        review: reviewList
                    }
                    const result = await (this.ctx as Context).http.post(
                        this.baseUrl + '/import', { list: [temp] },
                        { headers: { 'Authorization': webBottle.setToken(session), "Content-Type": "application/json; charset=utf-8" } }
                    )
                    console.log(`已成功上传ID为${bottle.id}的瓶子。对应服务器瓶子ID为：${result.ids}`);
                    dict.ok++
                    upId.push('' + bottle.id)
                } catch (error) {
                    console.log(error);
                    dict.err++
                    continue;
                }
            }
            // 来，处理后续的善后操作
            const lastUpdateId = updatedId.concat(upId)
            await webBottle.ctx.localstorage.setItem(webBottle.config.webFilingPath, JSON.stringify(lastUpdateId))
            await session.send(`已上传完成ID为${upId.length > 20 ? `${upId.slice(0, 20).join('、')}...的瓶子数据` : `${upId.join('、')}的瓶子数据`}`)
        } catch (error) {
            console.log(error);
            await session.send(error.response.data?.msg || '未知错误')
        }
    }
}

// 添加更多信息
function addMoreData(bottleData: WebBottleData) {
    bottleData.content.avatar = getPic({
        botId: bottleData.botId,
        platform: bottleData.platform,
        userId: bottleData.userId
    })
    bottleData.review.forEach((review) => {
        review.avatar = getPic({
            botId: review.botId,
            platform: review.platform,
            userId: review.userId
        })
    })
    return bottleData
}

// 获取对应平台头像
function getPic({ botId = '', platform = '', userId = '' }) {
    // qq       http://q.qlogo.cn/qqapp/${botid}/${item.userId}/640
    // onebot   https://q1.qlogo.cn/g?b=qq&nk=${item.userId}&s=0
    if (platform == 'qq') {
        return `http://q.qlogo.cn/qqapp/${botId}/${userId}/640`
    } else if (platform == 'onebot') {
        return `https://q1.qlogo.cn/g?b=qq&nk=${userId}&s=0`
    } else {
        return `http://smmcat.cn/wp-content/uploads/2024/12/DFC65DB8218C6820BD5E1BF181D545CD.jpg`
    }
}

function extractAppId(url: string): string | null {
    const match = url.match(/https:\/\/q\.qlogo\.cn\/qqapp\/(\d+)\//);
    return match ? match[1] : null;
}