import { Context, Session } from "koishi";
import { Config } from ".";

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
            return addMoreData(result.data)
        } catch (error) {
            console.log(error.response.data?.msg);
            return null
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
    }
}

// 添加更多信息
function addMoreData(bottleData: WebBottleData) {
    if (bottleData.platform == 'qq') {
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
    }
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