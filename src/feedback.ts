/** 
 * 
 * 反馈系统 
 * 
 * 
 * */

import { Context, Session } from "koishi";
import { Config } from ".";

export const feedback = {
    ctx: Context,
    config: Config,
    blacklistList: [],
    adminList: [],
    /** 反馈初始化 */
    async init(ctx: Context, config: Config) {
        this.ctx = ctx
        this.config = config
    },
    /** 验证用户是否为管理员 */
    verifyAdmin(session: Session) {

    },
    /** 提交反馈 */
    async setFeedback(session: Session) {

    },
    /** 查询反馈列表是否存在新内容 */
    async checkFeedbackList(session: Session) {
        if (!this.verifyAdmin(session)) return

    },
    /** 告知反馈目标 */
    async informFeekback(session: Session, fid: number) {
        if (!this.verifyAdmin(session)) return

    },
    /** 结束反馈 */
    async overFeekback(session: Session, fid: number) {
        if (!this.verifyAdmin(session)) return

    },
    /** 是否为黑名单用户 */
    async isBlacklist(session: Session) {

    }
}