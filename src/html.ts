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
    username?: string
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
        <span>${item.username ? `${item.username}：` : ''}${item.text ? item.text : ''} ${item.image ? item.image.map((item) => `<img src="${item}" />`).join('') : ''}</span>
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
        <div class="header">${temp.content.title}</div>
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
                    <div class="content">
                        <p>${item.text ? item.text : '无内容'}</p>
                        <!-- 图片内容，如果没有图片，可以移除下面的img标签 -->
                        ${item.image ? item.image.map((item) => {
                return `<img src="${item}" alt="图片内容">`
            }) : ''}
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