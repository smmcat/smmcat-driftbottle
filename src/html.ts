import { HistoryInfoList } from "."
import { WebBottleData } from "./webBottle"

/** 漂流瓶内容 */
type DiftContent = {
    /** 文本 */
    text: string | null,
    /** 图片 */
    image: string[] | null,
    /** 创建时间 */
    creatTime: number,
    /** 发送者 */
    userId?: string
    /** 发送者网名 */
    username?: string,
    /** 是否删除 */
    isDel?: boolean
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
    /** 发送者网名 */
    username?: string,
    /** 评论 */
    review: DiftContent[]
}

/** 日志图形化数据 */
type logsHTMLData = {
    myUserPic: string
    userPic: string
    time: number
    info: string
    isNew: boolean
}


export const createHTML = {
    driftContent(temp: DiftInfo, type = 0, botid: string, isOnebot = false) {
        switch (type) {
            case 0:
                return this.typeOne(temp, botid, isOnebot)
            case 1:
                return this.typeTwo(temp, botid, isOnebot)
            default:
                return this.typeOne(temp, botid, isOnebot)
        }
    },
    typeOne(temp: DiftInfo, botid: string, isOnebot: Boolean) {
        return `
       <!DOCTYPE html>
<html lang="zh">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>漂流瓶内容显示</title>
  <style>
      body,html {
          font-family: '微软雅黑', sans-serif;
          width:800px;
          min-height:400px;
          margin: 0;
          padding: 20px;
          text-align: center;
          background-color:transparent ; /* 便签背景色 */
      }
      .bottle-container {
          position: relative;
          border: 1px dashed #b0bec5;
          border-radius: 10px;
          padding:50px 20px 20px 20px;
          background-color: #fff8e1; /* 便签的背景色 */
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          width: 90%;
          margin: auto;
          overflow: hidden;
          line-height: 1.5;
      }
      .bottle-image {
          width: 60%;
          height: auto;
          border-radius: 5px;
          margin-bottom: 15px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
      }
      .content {
          color: #333;
          position: relative;
      }
      h2 {
          font-size: 30px;
          color: #6d4c41;
          margin-bottom: 10px;
          font-weight: bold;
          text-align: left;
          border-bottom: 1px solid #b0bec5;
          padding-bottom: 5px;
      }
      p {
          font-size: 26px;
          color: #555;
          text-align: left;
          word-wrap: break-word;
          white-space: pre-wrap;
          padding-left: 10px;
          margin: 0;
      }
      .sticky-note {
          position: absolute;
          top: -30px;
          right: -30px;
          width: 80px;
          height: 80px;
          background-color: #ffeb3b;
          transform: rotate(15deg);
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
          z-index: 1;
          border: 1px solid #fbc02d;
      }
    .count {
        font-size: 14px;
        color: #ff5722;
        margin-top: 10px;
        text-align: left;
    }
    .author {
        font-size: 16px;
        color: #6d4c41;
        margin-top: 15px;
        text-align: left;
        display: flex;
        align-items: center;
    }
    .author img {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        margin-right: 10px;
    }
    .comments {
        margin-top: 20px;
        text-align: left;
    }
    .comments h3 {
        font-size: 18px;
        color: #6d4c41;
        margin-bottom: 10px;
    }
    .comment {
        border: 1px solid #b0bec5;
        border-radius: 5px;
        padding: 10px;
        margin-bottom: 10px;
        display: flex;
        align-items: start;
        background-color: #f0f4c3; /* 评论区背景色 */
    }
    .comment span.del{
        font-size: 12px;
        border:1px dashed #ccc;
        padding: 5px 10px;
        color:rgb(113, 113, 113);
    }
    .comment>img {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        margin-right: 10px;
    }
    .comment-time {
        font-size: 12px;
        color: #888;
        margin-left: auto;
    }
    .comment span {
        padding-top: 4px;
    }
    .comment span img {
        max-width: 100px;
    }
    .license-plate {
        position: absolute;
        top: -10px;
        left: 10px;
        font-size: 24px; /* 大号字体 */
        color: red; /* 红色 */
        padding: 10px;
        border-radius: 5px;
        display: inline-block;
        margin-top: 10px;
    }   
  </style>
</head>
<body>

<div class="bottle-container">
  <div class="sticky-note"></div>
  <div class="license-plate">编号: ${String(temp.id).padStart(5, '0')}</div>
  ${temp.content.image ? temp.content.image.map((item) => `<img src="${item}" alt="漂流瓶插图" class="bottle-image">`).join('') : ''}
  <div class="content">
      <h2>${temp.content.title ? temp.content.title : '无标题'}</h2>
      <p>${temp.content.text ? temp.content.text : '无内容'}</p>
      <div class="count">被捞起的次数：${temp.getCount}</div>
        <div class="author">
         <img src="${isOnebot ? `https://q1.qlogo.cn/g?b=qq&nk=${temp.userId}&s=0` : `http://q.qlogo.cn/qqapp/${botid}/${temp.userId}/640`}" alt="作者头像">
         <span>作者 ${temp.username ? temp.username : ''}</span>
         <span style="margin-left:10px;">创建时间：${temp.content.creatTime ? uilts.formatTimestamp(temp.content.creatTime) : '未知'}</span>
    </div>
  </div>
  ${temp.review.length ? `<div class="comments">
    <h3>评论区</h3>
    ${temp.review.map((item) => {
            return `<div class="comment">
        <img src="${isOnebot ? `https://q1.qlogo.cn/g?b=qq&nk=${item.userId}&s=0` : `http://q.qlogo.cn/qqapp/${botid}/${item.userId}/640`}" alt="用户A头像">
        ${item.isDel ? '<span class="del">管理员已删除该条评论</span>' : `<span>${item.username ? `${item.username}：` : ''}${item.text ? item.text : ''} ${item.image ? item.image.map((item) => `<img src="${item}" />`).join('') : ''}</span>`}
        <span class="comment-time">${item.creatTime ? uilts.formatTimestamp(item.creatTime) : '未知'}</span>
    </div>`
        }).join('')}
</div>`: ''}
</div>
</body>
</html>   
       `
    },
    typeTwo(temp: DiftInfo, botid: string, isOnebot: boolean) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>漂流瓶</title>
<style>
   /* 基础样式 */
body {
    font-family: 'Arial', sans-serif; /* 设置字体 */
    background-color: #f0f8ff; /* 设置页面背景色 */
    margin: 0;
    padding: 20px;
}

/* 容器样式 */
.container {
    max-width: 600px; /* 最大宽度 */
    margin: auto; /* 居中显示 */
    background-color: #fff; /* 背景色 */
    border-radius: 10px; /* 圆角边框 */
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); /* 阴影效果 */
    overflow: hidden; /* 隐藏溢出的内容 */
    font-size: 14px; /* 字体大小 */
}

/* 页眉样式 */
.header {
    background-color: #87CEFA; /* 蓝色背景 */
    color: #fff; /* 文字颜色 */
    padding: 15px; /* 内边距 */
    text-align: center; /* 文本居中 */
    font-size: 24px; /* 字体大小 */
    border-bottom: 1px solid #80bfff; /* 下边框 */
}

/* 漂流瓶区块 */
.bottle {
    padding: 20px; /* 内边距 */
}

/* 漂流瓶信息样式 */
.bottle-info {
    background-color: #e6f7ff; /* 淡蓝色背景 */
    padding: 15px; /* 内边距 */
    border-radius: 15px; /* 圆角边框 */
    margin-bottom: 20px; /* 下外边距 */
    position: relative; /* 为绝对定位的子元素提供参考 */
}

/* 作者信息样式 */
.author-info {
    display: flex; /* 弹性盒模型 */
    align-items: center; /* 垂直居中 */
    margin-bottom: 10px; /* 下外边距 */
}

/* 头像样式 */
.avatar {
    width: 50px; /* 宽度 */
    height: 50px; /* 高度 */
    border-radius: 50%; /* 圆形 */
    background-color: #bddff8; /* 淡蓝色背景 */
    overflow: hidden; /* 隐藏溢出的内容 */
}

/* 头像图片样式 */
.avatar img {
    width: 100%; /* 宽度 */
    height: auto; /* 高度自动 */
}

/* 作者内容样式 */
.author-content {
    margin-left: 10px; /* 左外边距 */
}

/* 昵称样式 */
.nickname {
    font-weight: bold; /* 加粗字体 */
    color: #333; /* 字体颜色 */
}

/* 时间和被捞起次数样式 */
.time, .pickup-count {
    color: #888; /* 灰色字体 */
    font-size: 12px; /* 字体大小 */
}

/* 被捞起次数位置样式 */
.pickup-count {
    position: absolute; /* 绝对定位 */
    top: 15px; /* 距顶部距离 */
    right: 15px; /* 距右侧距离 */
}

/* 内容区域样式 */
.content {
    margin-top: 10px; /* 顶部外边距 */
    color: #444; /* 字体颜色 */
}

.content.del p{
   color:rgb(128, 9, 9);
   border:1px dashed #ccc;
   padding: 5px 10px;
   word-wrap: break-word;
   white-space: pre-wrap;
}

/* 图片内容样式 */
.content img {
    max-width: 100%; /* 最大宽度 */
    border-radius: 10px; /* 圆角边框 */
    margin-top: 10px; /* 顶部外边距 */
}

/* 留言区域样式 */
.messages {
    padding: 0 20px 20px; /* 内边距 */
}

/* 单条留言样式 */
.message {
    background-color: #d0eaff; /* 淡蓝色背景 */
    padding: 15px; /* 内边距 */
    border-radius: 15px; /* 圆角边框 */
    margin-bottom: 20px; /* 下外边距 */
}

/* 留言信息样式 */
.message-info {
    display: flex; /* 弹性盒模型 */
    align-items: center; /* 垂直居中 */
    margin-bottom: 10px; /* 下外边距 */
}

/* 留言内容样式 */
.message-content {
    margin-left: 10px; /* 左外边距 */
}

</style>
</head>
<body>
    <div class="container">
        <div class="header">${temp.content.title || '无标题'}</div>
        <div class="bottle">
            <div class="bottle-info">
                <div class="pickup-count">被捞起次数：${temp.getCount}</div>
                <div class="author-info">
                    <div class="avatar"><img src="${isOnebot ? `https://q1.qlogo.cn/g?b=qq&nk=${temp.userId}&s=0` : `http://q.qlogo.cn/qqapp/${botid}/${temp.userId}/640`}" alt="用户头像"></div>
                    <div class="author-content">
                        <div class="nickname">${temp.username ? temp.username : temp.userId.slice(0, 5) + '...'}</div>
                        <div class="time">扔瓶时间: ${temp.content.creatTime ? uilts.formatTimestamp(temp.content.creatTime) : '未知'}</div>
                    </div>
                </div>
                <div class="content">
                    <p>${temp.content.text ? temp.content.text : "无内容"}</p>
                    <!-- 图片内容，如果没有图片，可以移除下面的img标签 -->
                    ${temp.content.image ? temp.content.image.map((item) => {
            return `<img src="${item}" alt="图片内容">`
        }) : ''}
                </div>
            </div>
            ${temp.review.length ? `<div class="messages">
                <!-- 留言内容开始 -->
                ${temp.review.map((item) => {
            return `<div class="message">
                    <div class="message-info">
                        <div class="avatar"><img src="${isOnebot ? `https://q1.qlogo.cn/g?b=qq&nk=${item.userId}&s=0` : `http://q.qlogo.cn/qqapp/${botid}/${item.userId}/640`}" alt="留言人头像"></div>
                        <div class="message-content">
                            <div class="nickname">${item.username ? item.username : item.userId.slice(0, 5) + '...'}</div>
                            <div class="time">留言时间: ${item.creatTime ? uilts.formatTimestamp(item.creatTime) : '未知'}</div>
                        </div>
                    </div>
                    <div class="content ${item.isDel ? 'del' : ''}">
                        ${item.isDel ? '<p>该内容已被管理员删除</p>' : `<p>${item.text ? item.text : '无内容'}</p>
                        <!-- 图片内容，如果没有图片，可以移除下面的img标签 -->
                        ${item.image ? item.image.map((item) => {
                return `<img src="${item}" alt="图片内容">`
            }) : ''}`}
                    </div>
                </div>`
        })}
                <!-- 留言内容结束 -->
                <!-- 更多留言可以复制上面的.message块 -->
            </div>`: ''}
        </div>
    </div>
</body>
</html>
`
    },
    logsContent(temp: logsHTMLData[]) {
        return `
      <!DOCTYPE html>
<html lang="zh">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>日志列表</title>
    <style>
        * {
            margin: 0;
            padding: 0;
        }

        body,
        html {
            font-family: Arial, sans-serif;
            width: 800px;
            min-height: 600px;
            background-color: transparent;
        }

        .container {
            padding: 10px;
            display: flex;
            flex-direction: column;
            min-height: 600px;
            background-color: #fff8e1;
            position: relative;
        }

        .timeline {
            flex: 1;
            position: relative;
            transform: translate(10px, 0);
            width: 98%;
            border-left: 2px dashed #443c3c;
            padding-left: 20px;
        }

        .timeline-item {
            max-width: 90%;
            margin: 10px 0;
            position: relative;
            display: flex;
            align-items: center;
        }

        .timeline-item:before {
            content: '';
            position: absolute;
            left: -16px;
            top: 10px;
            width: 0;
            height: 0;
            border: 10px solid transparent;
            border-left-color: #331e04;
        }

        .content {
            width: 100%;
            margin-left: 0px;
            border: 1px solid #ccc;
            background-image: linear-gradient(#ffffff 80%, #fdfef4);
            border-radius: 5px;
            padding: 10px 15px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
            position: relative;
            /* max-width: 500px; */
        }

        img {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            margin: 0 10px;
            margin-bottom: 3px;
            vertical-align: middle;
        }

        .bubble {
            display: flex;
            align-items: center;
        }

        span {
            font-weight: bold;
            color: red;
            margin: 0 5px;
            font-size: 20px;
        }

        .event {
            width: 700px;
            color: #331e04;
            padding-bottom: 2px;
            border-bottom: 2px dashed #ccc;
        }

        .time {
            margin-top: 5px;
            color: #888;
            font-size: 0.9em;
        }

        .title {
            display: flex;
            font-weight: bold;
            justify-content: center;
            align-items: center;
            color: #331e04;
            font-size: 20px;
            border-bottom: 2px solid #211a12;
            height: 50px;
            margin-bottom: 4px;
        }
       .new::before{
            position: absolute;
            top: -15px;
            right: 10px;
            content: '新！';
            color: rgb(0, 182, 42);
            font-weight: bold;
            font-size: 28px;
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="title">日志列表</div>
        <div class="timeline">
            
                ${temp.length ? temp.map((item) => {
            return `
            <div class="timeline-item">
                <div class="content bubble">
                    <div>
                        <div class="event ${item.isNew ? 'new' : ''}">
                            ${item.info}
                        </div>
                        <div class="time">${uilts.formatTimestamp(item.time)}</div>
                    </div>
                </div>
            </div>    
                 `
        }).join('') : `
        <div class="timeline-item">
                <div class="content bubble" style="display: flex;align-items: center;justify-content: center;">
                    暂无数据
                </div>
        </div>
        `}
            
        </div>
    </div>
</body>
</html>
      `
    },
    reovmeCommentMap(temp: DiftInfo, botid: string, isOnebot = false) {
        return `
       <!DOCTYPE html>
<html lang="zh-CN">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>评论管理</title>
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
        }

        body {
            max-width: 800px;
            background-color: #f5f5f5;
            padding: 20px;
        }

        .container {
            max-width: 800px;
            margin: 0 auto;
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            padding: 20px;
        }

        h1 {
            color: #333;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 1px solid #eee;
        }

        .review-list {
            margin-top: 20px;
        }

        .review-item {
            padding: 15px;
            border: 1px solid #eee;
            border-radius: 6px;
            margin-bottom: 15px;
            display: flex;
            align-items: flex-start;
            transition: all 0.3s ease;
        }

        .review-item:hover {
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background-color: #f0f0f0;
            margin-right: 15px;
            overflow: hidden;
            flex-shrink: 0;
        }

        .avatar img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .review-content {
            flex: 1;
        }

        .review-text {
            font-size: 16px;
            margin-bottom: 8px;
            word-break: break-word;
        }

        .review-meta {
            font-size: 12px;
            color: #999;
        }

        .review-actions {
            font-size: 26px;
            font-weight: 800;
            color: #ff4d4f;
            justify-content: center;
            align-items: center;
            padding: 13px 20px;
            background-color: aliceblue;
            margin-left: 15px;
        }

        .delete-btn {
            background-color: #ff4d4f;
            color: white;
            border: none;
            padding: 6px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            transition: background-color 0.3s;
        }

        .delete-btn:hover {
            background-color: #ff7875;
        }

        .batch-actions {
            margin-top: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .select-all {
            display: flex;
            align-items: center;
        }

        .select-all input {
            margin-right: 8px;
        }

        .batch-delete-btn {
            background-color: #ff4d4f;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            transition: background-color 0.3s;
        }

        .batch-delete-btn:hover {
            background-color: #ff7875;
        }

        .batch-delete-btn:disabled {
            background-color: #d9d9d9;
            cursor: not-allowed;
        }

        .empty-state {
            text-align: center;
            padding: 40px 0;
            color: #999;
        }

        .timestamp {
            display: inline-block;
            margin-right: 10px;
        }

        .user-id {
            display: inline-block;
        }
        .review-text img {
            margin: 0 5px;
            vertical-align: text-top;
            max-width: 70px;
        }
        .review-text.del {
            border: 1px dashed #ccc;
            padding: 5px 10px;
        }

        .review-text.del::before {
            content: '被删除的内容：';
        }
    </style>
</head>

<body>
    <div class="container">
        <h1>关于 ID ${temp.id} 瓶子的评论管理</h1>
        <div class="review-list" id="review-list">
            ${temp.review.map((item, index) => {
            return `
                <div class="review-item">
                <div class="avatar">
                    <img src="${isOnebot ? `https://q1.qlogo.cn/g?b=qq&nk=${item.userId}&s=0` : `http://q.qlogo.cn/qqapp/${botid}/${item.userId}/640`}">
                </div>
                <div class="review-content">
                ${item.isDel ? `<div class="review-text del">${item.text}</div>` : `<div class="review-text">${item.text} ${item.image ? item.image.map((img) => {
                return `<img src="${img}" />`
            }) : ''}</div>`}
                    <div class="review-meta">
                        <span class="timestamp">${uilts.formatTimestamp(item.creatTime)}</span>
                        <span class="user-id">用户ID: ${item.userId} ${item.username ? `(${item.username})` : ''}</span>
                    </div>
                </div>
                <div class="review-actions">
                    ${index + 1}
                </div>
            </div>
                `
        }).join('')}
        </div>
    </div>
</body>
</html>
       `
    },
    historyDriftbottleMap(temp: HistoryInfoList[], botid: string, isOnebot = false, allNum = 0) {
        const dict = { '图片瓶': 'image', '图文瓶': 'image_text', '文本瓶': 'text', '语音瓶': 'audio' }
        const driftbottleList = []
        for (let i = 0; i < 50; i++) {
            if (i == 49) {
                if (temp.length >= 49) {
                    driftbottleList.push(`
                <div class="line">
                   <div class="more"></div>
                </div>
               `)
                } else {
                    driftbottleList.push(`
                <div class="line">
                </div>
               `)
                }
            } else {
                driftbottleList.push(`
                <div class="line">
                ${temp[i] ? `
                    <div class="item ${dict[temp[i].type]}">${temp[i].id}<img
                        src="${isOnebot ? `https://q1.qlogo.cn/g?b=qq&nk=${temp[i].userId}&s=0` : `http://q.qlogo.cn/qqapp/${botid}/${temp[i].userId}/640`}">
                    </div>
                    `: ''}
            </div>
                `)
            }
        }
        return `
        <!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
        * {
            margin: 0;
            padding: 0;
        }

        body,
        html {
            max-width: 800px;
        }

        .content {
            box-sizing: border-box;
            width: 800px;
            min-height: 400px;
        }

        .content h4 {
            padding: 10px 0;
            text-align: center;
        }

        .bottleList {
            position: relative;
            box-sizing: border-box;
            display: grid;
            grid-template-columns: repeat(10, 1fr);
            grid-template-rows: repeat(4, 1fr);
            width: 100%;
            min-height: 400px;
            gap: 5px;
            padding: 5px;
            overflow: hidden;
            border: 6px solid #925f00;
        }

        .bottleList::before {
            position: absolute;
            top: 0;
            left: 0;
            display: block;
            content: '';
            width: 100%;
            height: 100%;
            overflow: hidden;
            background: url('https://smmcat.cn/run/plp.jpg');
            filter: blur(10px);
            background-size: cover;
        }

        .bottleList .line {
            position: relative;
            width: 100%;
            height: 100px;
            box-sizing: border-box;
        }


        .bottleList .line::before {
            position: absolute;
            content: '';
            display: block;
            top: 7px;
            left: 50%;
            transform: translate(-50%, 0);
            height: 16px;
            width: 120%;
            background-image: url('https://smmcat.cn/run/driftbottle/line.png');
        }

        .bottleList .item {
            display: flex;
            overflow: hidden;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            word-break: break-word;
            text-align: center;
            line-height: 20px;
            font-weight: 800;
            color: rgba(244, 0, 0, 0.905);
            text-shadow: 0px 0px 15px gold;
            font-size: 20px;
            height: 100px;
            background-image: url(https://smmcat.cn/run/driftbottle/bottle.png);
            background-repeat: no-repeat;
            background-position: center center;
            background-size: cover;
        }

        .bottleList .item.image {
            background-image: url(https://smmcat.cn/run/driftbottle/bottle_image.png);
        }

        .bottleList .item.image_text {
            background-image: url(https://smmcat.cn/run/driftbottle/bottle_image_text.png);
        }

        .bottleList .item.text {
            background-image: url(https://smmcat.cn/run/driftbottle/bottle_text.png);
        }

        .bottleList .item.audio {
            background-image: url(https://smmcat.cn/run/driftbottle/bottle_audio.png);
        }

        .bottleList .item img {
            position: absolute;
            left: 50%;
            top: 60%;
            z-index: -1;
            transform: translate(-50%, -50%);
            margin-top: 2px;
            border: 2px solid #925f00;
            border-radius: 50%;
            width: 25px;
            height: 25px;
        }

        .bottleList .more {
            position: relative;
            height: 100px;
        }

        .bottleList .more::before {
            position: absolute;
            content: '...';
            color: #925f00;
            font-size: 40px;
            display: flex;
            width: 100%;
            height: 100%;
            justify-content: center;
            align-items: center;
        }
    </style>
</head>

<body>
    <div class="content">
        <h4>已获得的瓶子记录 (一共有 ${allNum} 个瓶子拾取过)</h4>
        <div class="bottleList">
           ${driftbottleList.join('')}
        </div>
    </div>
    <script>
        document.addEventListener('DOMContentLoaded', function () {
            const items = document.querySelectorAll('.item');

            items.forEach(item => {
                // 随机生成 -10° 到 10° 之间的旋转角度
                const randomRotation = (Math.random() * 20) - 10;
                item.style.transform = `+ "`rotate(${ randomRotation }deg)`" + `;
            });
        });
    </script>
</body>

</html>
        `
    },
    generateBottleHTML(data: WebBottleData) {
        // 格式化时间戳
        function formatTime(timestamp) {
            const date = new Date(timestamp);
            return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        }

        // 生成评论列表HTML
        let commentsHTML = '';
        if (data.review && data.review.length > 0) {
            commentsHTML = data.review.map(comment => `
            <div class="item">
                <div class="comment-avatar">
                    <img src="${comment.avatar}">
                </div>
                <div class="comment-content">
                    <div class="comment-text">${comment.text}</div>
                    <div class="comment-time">${formatTime(comment.createTime)}</div>
                </div>
            </div>
        `).join('');
        }

        // 生成图片列表HTML
        let imagesHTML = '';
        if (data.content.image && data.content.image.length > 0) {
            imagesHTML = data.content.image.map(img => `
            <img src="${img}" alt="漂流瓶图片">
        `).join('');
        }

        return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>漂流瓶</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
        }

        body, html {
            width: 600px;
            min-height: 400px;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            padding: 15px;
        }

        .bottle-container {
            background-color: white;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            margin-bottom: 15px;
        }

        .title {
            background: linear-gradient(90deg, #66ccff 0%, #4da6ff 100%);
            color: white;
            padding: 12px 20px;
            text-align: center;
            position: relative;
        }

        .title h3 {
            font-size: 18px;
            font-weight: 600;
            letter-spacing: 1px;
        }

        .title::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 3px;
            background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.7) 50%, transparent 100%);
        }

        .content {
            padding: 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        .user-info {
            display: flex;
            align-items: center;
            width: 100%;
            margin-bottom: 15px;
        }

        .avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            overflow: hidden;
            margin-right: 12px;
            border: 2px solid #e6f7ff;
        }

        .avatar img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .user-details {
            flex: 1;
        }

        .user-id {
            font-size: 14px;
            color: #666;
            margin-bottom: 2px;
        }

        .time {
            font-size: 12px;
            color: #999;
        }

        .text-content {
            width: 100%;
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 15px;
            line-height: 1.6;
            color: #333;
            border-left: 4px solid #66ccff;
        }

        .text-content img {
            max-width: 250px;
        }

        .img-list {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 10px;
            width: 100%;
        }

        .img-list img {
            max-width: 250px;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .comment {
            background-color: white;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }

        .comment h3 {
            background: linear-gradient(90deg, #ff9966 0%, #ff5e62 100%);
            color: white;
            padding: 12px 20px;
            font-size: 18px;
            font-weight: 600;
            letter-spacing: 1px;
        }

        .comment-list {
            padding: 15px;
        }

        .item {
            display: flex;
            margin-bottom: 15px;
            padding-bottom: 15px;
            border-bottom: 1px solid #f0f0f0;
        }

        .item:last-child {
            margin-bottom: 0;
            padding-bottom: 0;
            border-bottom: none;
        }

        .comment-avatar {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            overflow: hidden;
            margin-right: 12px;
            flex-shrink: 0;
            border: 2px solid #ffe6e6;
        }

        .comment-avatar img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .comment-content {
            flex: 1;
            background-color: #f8f9fa;
            padding: 12px;
            border-radius: 8px;
            position: relative;
        }

        .comment-content::before {
            content: '';
            position: absolute;
            left: -8px;
            top: 12px;
            width: 0;
            height: 0;
            border-top: 8px solid transparent;
            border-bottom: 8px solid transparent;
            border-right: 8px solid #f8f9fa;
        }

        .comment-text {
            color: #333;
            line-height: 1.5;
            margin-bottom: 5px;
        }

        .comment-time {
            font-size: 11px;
            color: #999;
            text-align: right;
        }
    </style>
</head>

<body>
    <div class="bottle-container">
        <div class="title">
            <h3>早上好 #ID ${data.id}</h3>
        </div>
        <div class="content">
            <div class="user-info">
                <div class="avatar">
                    <img src="${data.content.avatar}">
                </div>
                <div class="user-details">
                    <div class="user-id">用户ID: ${data.content.userId.slice(0, 4) + '...'}</div>
                    <div class="time">发布时间: ${formatTime(data.content.createTime)}</div>
                </div>
            </div>
            <div class="text-content">
                ${data.content.text}
            </div>
            <div class="img-list">
                ${imagesHTML}
            </div>
        </div>
    </div>
    
    <div class="comment">
        <h3>评论区 (${data.review ? data.review.length : 0})</h3>
        <div class="comment-list">
            ${commentsHTML || '<div style="text-align:center;padding:20px;color:#999;">暂无评论</div>'}
        </div>
    </div>
</body>
</html>`;
    }

}

const uilts = {
    formatTimestamp(timestamp: number) {
        const date = new Date(timestamp);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}年${month}月${day}日 ${hours}时${minutes}分`;
    }
}