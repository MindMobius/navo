// 站点数据示例（实际项目中会从API获取）
const sampleSites = [
    {
        id: 1,
        suid: "abc123",
        name: "Remove.bg",
        url: "https://www.remove.bg",
        reviews: [
            {
                content: "一个非常好用的**在线抠图工具**，能快速移除图片背景，支持透明背景下载。\n\n- 处理速度快\n- 效果自然\n- 支持多种格式",
                updatedAt: "2025-09-01T10:00:00Z"
            },
            {
                content: "处理效果很棒，特别是对于头发丝的处理很自然，比其他免费工具好用多了。这个工具真的帮我节省了很多时间。\n\n> 强烈推荐设计师使用",
                updatedAt: "2025-09-02T14:30:00Z"
            }
        ],
        tags: ["图片处理", "设计", "AI工具"],
        createdAt: "2025-09-01T08:00:00Z",
        updatedAt: "2025-09-02T14:30:00Z"
    },
    {
        id: 2,
        suid: "def456",
        name: "GitHub",
        url: "https://github.com",
        reviews: [
            {
                content: "全球最大的代码托管平台，支持Git版本控制，可以托管代码、管理项目。\n\n支持的功能：\n1. 代码托管\n2. 版本控制\n3. 协作开发",
                updatedAt: "2025-08-20T09:15:00Z"
            }
        ],
        tags: ["开发", "代码托管"],
        createdAt: "2025-08-20T09:00:00Z",
        updatedAt: "2025-08-20T09:15:00Z"
    },
    {
        id: 3,
        suid: "ghi789",
        name: "Coolors",
        url: "https://coolors.co",
        reviews: [
            {
                content: "优秀的配色方案生成工具，可以快速生成和谐的配色方案，支持锁定颜色。\n\n```js\n// 示例代码\nconst colors = generatePalette();\nconsole.log(colors);\n```",
                updatedAt: "2025-09-05T11:20:00Z"
            },
            {
                content: "我每天都会用这个工具来寻找灵感，界面简洁，功能强大。",
                updatedAt: "2025-09-06T16:45:00Z"
            },
            {
                content: "特别喜欢它的导出功能，可以导出多种格式，非常方便。\n\n支持的格式包括：\n- CSS\n- SCSS\n- JSON\n- SVG",
                updatedAt: "2025-09-07T09:30:00Z"
            }
        ],
        tags: ["设计", "配色", "灵感"],
        createdAt: "2025-09-05T11:00:00Z",
        updatedAt: "2025-09-07T09:30:00Z"
    },
    {
        id: 4,
        suid: "jkl012",
        name: "本地NAS",
        url: "http://192.168.1.100:5000",
        reviews: [
            {
                content: "个人NAS管理面板，可以管理文件、下载任务、媒体服务等。\n\n支持的协议：\n- SMB\n- AFP\n- FTP\n- WebDAV",
                updatedAt: "2025-07-15T13:10:00Z"
            }
        ],
        tags: ["私有服务", "NAS"],
        createdAt: "2025-07-15T13:00:00Z",
        updatedAt: "2025-07-15T13:10:00Z"
    },
    {
        id: 5,
        suid: "mno345",
        name: "OneDrivesahidshaihdiashdiashdiahdiashdiashdiashdiashdiahsdiashi",
        url: "https://onedrive.live.com/asdhjasdhssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss",
        reviews: [
            {
                content: "微软的云存储服务，可以保存、同步文件和图片。\n\n支持的协议：\n- SMB\n- AFP\n- FTP\n- WebDAV",
                updatedAt: "2025-08-10T09:30:"
            }
        ],
        tags: ["云存储", "私有服务"],
        createdAt: "2025-08-10T09:00:00Z",
        updatedAt: "2025-08-10T09:30:00Z"

    }

];

// 用于追踪每个站点当前显示的评论索引
const siteReviewIndices = {};

// 搜索历史数组
let searchHistory = [];

// 动态占位符文本
const placeholderTexts = [
    "搜索网址、用户名或关键词...",
    "试试搜索 '设计' 或 '开发'",
    "查找您需要的工具和资源",
    "输入网站名称或功能描述"
];

let placeholderIndex = 0;
let charIndex = 0;
let isDeleting = false;
let currentPlaceholder = "";
let placeholderTimer;

// 渲染站点卡片
function renderSites(sites) {
    const siteGrid = document.getElementById('siteGrid');
    siteGrid.innerHTML = '';
    
    sites.forEach(site => {
        // 初始化当前站点的评论索引
        if (siteReviewIndices[site.id] === undefined) {
            siteReviewIndices[site.id] = 0;
        }
        
        const card = document.createElement('div');
        card.className = 'site-card';
        
        // 获取当前显示的评论
        const currentReviewIndex = siteReviewIndices[site.id];
        const currentReview = site.reviews[currentReviewIndex];
        
        // 获取网站图标（这里使用网站URL的favicon）
        const siteUrl = new URL(site.url);
        const siteIcon = `https://www.google.com/s2/favicons?domain=${siteUrl.hostname}`;
        
        // 截断长文本
        const truncateText = (text, maxLength) => {
            if (text.length <= maxLength) {
                return text;
            }
            return text.substring(0, maxLength) + '...';
        };
        
        card.innerHTML = `
            <div class="site-card-info">
                <div class="site-card-name" title="${site.name}">
                    <img src="${siteIcon}" alt="${site.name}" class="site-icon" onerror="this.style.display='none'">
                    ${truncateText(site.name, 20)}
                </div>
                <a class="site-card-url" href="${site.url}" target="_blank" title="${site.url}">
                    <i data-feather="external-link" class="url-icon"></i>
                    ${truncateText(site.url, 40)}
                </a>
            </div>
            <div class="site-card-actions">
                <button class="action-btn detail-btn" onclick="showSiteDetails(${site.id}); event.stopPropagation();" title="详情">
                    <i data-feather="info"></i>
                </button>
                <button class="action-btn comment-btn" onclick="showCommentModal(${site.id}); event.stopPropagation();" title="评论">
                    <i data-feather="message-square"></i>
                </button>
            </div>
            <div class="site-card-reviews">
                <div class="review-content">
                    ${renderMarkdown(currentReview.content)}
                </div>
                <button class="random-review-btn" onclick="showRandomReview(${site.id}); event.stopPropagation();">换一条</button>
            </div>
        `;
        siteGrid.appendChild(card);
    });
    
    // 重新渲染feather图标
    feather.replace();
}

// 显示随机评论
function showRandomReview(siteId) {
    const site = sampleSites.find(s => s.id === siteId);
    if (!site) return;
    
    // 获取不重复的随机索引
    let newIndex;
    do {
        newIndex = Math.floor(Math.random() * site.reviews.length);
    } while (site.reviews.length > 1 && newIndex === siteReviewIndices[siteId]);
    
    siteReviewIndices[siteId] = newIndex;
    renderSites(sampleSites);
}

// 显示站点详情
function showSiteDetails(siteId) {
    const site = sampleSites.find(s => s.id === siteId);
    if (!site) return;
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'detailModal';
    
    // 格式化日期
    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleString('zh-CN');
    };
    
    // 截断长文本
    const truncateText = (text, maxLength) => {
        if (text.length <= maxLength) {
            return text;
        }
        return text.substring(0, maxLength) + '...';
    };
    
    // 构建评论列表HTML
    const reviewsHtml = site.reviews.map(review => `
        <div class="review-item">
            <div class="review-item-header">
                <span class="review-date">${formatDate(review.updatedAt)}</span>
            </div>
            <div class="review-content-full">${renderMarkdown(review.content)}</div>
        </div>
    `).join('');
    
    // 处理名称和URL的显示
    const displayName = truncateText(site.name, 20);
    const displayUrl = truncateText(site.url, 50);
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2 class="modal-title" title="${site.name}">${truncateText(site.name, 25)}</h2>
                <button class="close" onclick="closeModal('detailModal')">&times;</button>
            </div>
            <div class="modal-body">
                <div class="site-detail-info">
                    <dl>
                        <dt>ID:</dt>
                        <dd>${site.id}</dd>
                        
                        <dt>SUID:</dt>
                        <dd>
                            <div class="suid-copy-container">
                                <div class="suid-value">${site.suid}</div>
                                <button class="copy-suid-btn" onclick="copySuid('${site.suid}', this)">复制</button>
                            </div>
                        </dd>
                        
                        <dt>网站名称:</dt>
                        <dd class="name-value">
                            <textarea readonly onclick="copyText(this)" title="点击复制">${site.name}</textarea>
                        </dd>
                        
                        <dt>网站地址:</dt>
                        <dd class="url-value">
                            <textarea readonly onclick="copyText(this)" title="点击复制">${site.url}</textarea>
                        </dd>
                        
                        <dt>创建时间:</dt>
                        <dd>${formatDate(site.createdAt)}</dd>
                        
                        <dt>更新时间:</dt>
                        <dd>${formatDate(site.updatedAt)}</dd>
                    </dl>
                </div>
                <div class="site-reviews-list">
                    <h3>评论内容</h3>
                    ${reviewsHtml}
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // 重新渲染feather图标
    feather.replace();
}

// 复制SUID到剪贴板
function copySuid(suid, button) {
    navigator.clipboard.writeText(suid).then(() => {
        // 显示复制成功提示
        const originalText = button.textContent;
        button.textContent = '已复制';
        setTimeout(() => {
            button.textContent = originalText;
        }, 2000);
    }).catch(err => {
        console.error('复制失败:', err);
        // 创建一个临时input元素来复制文本
        const textArea = document.createElement('textarea');
        textArea.value = suid;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            const originalText = button.textContent;
            button.textContent = '已复制';
            setTimeout(() => {
                button.textContent = originalText;
            }, 2000);
        } catch (err) {
            console.error('复制失败:', err);
        }
        document.body.removeChild(textArea);
    });
}

// 显示评论模态框
function showCommentModal(siteId) {
    const site = sampleSites.find(s => s.id === siteId);
    if (!site) return;
    
    const modal = document.createElement('div');
    modal.className = 'modal comment-modal';
    modal.id = 'commentModal';
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2 class="modal-title">为 ${site.name} 添加评论</h2>
                <button class="close" onclick="closeModal('commentModal')">&times;</button>
            </div>
            <div class="modal-body">
                <form id="commentForm">
                    <div class="form-group">
                        <label for="commentContent">评论内容（支持Markdown语法）</label>
                        <textarea id="commentContent" required placeholder="请输入评论内容，支持Markdown语法"></textarea>
                    </div>
                    <div class="form-group">
                        <button type="submit" class="btn-primary">提交评论</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // 绑定表单提交事件
    document.getElementById('commentForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const content = document.getElementById('commentContent').value;
        
        if (content) {
            // 添加新评论到站点
            site.reviews.push({
                content: content,
                updatedAt: new Date().toISOString()
            });
            
            // 关闭模态框
            closeModal('commentModal');
            
            // 重新渲染站点卡片
            renderSites(sampleSites);
            
            // 显示成功消息（简单alert，实际项目中可能需要更好的提示）
            alert('评论添加成功！');
        }
    });
    
    // 重新渲染feather图标
    feather.replace();
}

// 关闭模态框
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        modal.remove();
        document.body.style.overflow = 'auto';
    }
}

// 使用marked库渲染Markdown
function renderMarkdown(markdown) {
    if (!markdown) return '';
    return marked.parse(markdown);
}

// 搜索功能
function searchSites(keyword) {
    if (!keyword) {
        return sampleSites;
    }
    
    // 添加到搜索历史
    addToSearchHistory(keyword);
    
    return sampleSites.filter(site => 
        site.name.toLowerCase().includes(keyword.toLowerCase()) ||
        site.url.toLowerCase().includes(keyword.toLowerCase()) ||
        site.reviews.some(review => 
            review.content.toLowerCase().includes(keyword.toLowerCase())
        ) ||
        (site.tags && site.tags.some(tag => tag.toLowerCase().includes(keyword.toLowerCase())))
    );
}

// 添加搜索历史
function addToSearchHistory(keyword) {
    // 如果已存在则移除
    searchHistory = searchHistory.filter(item => item !== keyword);
    // 添加到开头
    searchHistory.unshift(keyword);
    // 限制最多显示10个历史记录
    if (searchHistory.length > 10) {
        searchHistory = searchHistory.slice(0, 10);
    }
    // 保存到本地存储
    localStorage.setItem('navoSearchHistory', JSON.stringify(searchHistory));
    // 更新搜索历史显示
    renderSearchHistory();
}

// 渲染搜索历史
function renderSearchHistory() {
    const searchHistoryContainer = document.getElementById('searchHistory');
    if (!searchHistoryContainer) return;
    
    // 清空现有内容
    searchHistoryContainer.innerHTML = '';
    
    // 只有在有搜索历史时才显示标题和历史记录
    if (searchHistory.length > 0) {
        
        // 添加全部清除按钮
        const clearAllBtn = document.createElement('button');
        clearAllBtn.className = 'clear-all-btn';
        clearAllBtn.textContent = '全部清除';
        searchHistoryContainer.appendChild(clearAllBtn);

        // 添加标题
        const titleSpan = document.createElement('span');
        titleSpan.textContent = '搜索历史：';
        searchHistoryContainer.appendChild(titleSpan);
        
        // 添加历史记录项 (最多显示10个)
        searchHistory.slice(0, 5).forEach(keyword => {
            const historyItem = document.createElement('div');
            historyItem.className = 'search-history-item';
            
            // 限制文本长度最多10个字
            let displayKeyword = keyword;
            if (keyword.length > 10) {
                displayKeyword = keyword.substring(0, 10) + '...';
            }
            
            historyItem.innerHTML = `
                <span class="keyword">${displayKeyword}</span>
                <button class="remove-btn" data-keyword="${keyword}">×</button>
            `;
            searchHistoryContainer.appendChild(historyItem);
        });
        
        // 绑定点击事件
        searchHistoryContainer.querySelectorAll('.search-history-item .keyword').forEach(item => {
            item.addEventListener('click', function() {
                const keyword = this.textContent;
                // 恢复完整关键词（去除省略号）
                let fullKeyword = keyword;
                if (keyword.endsWith('...')) {
                    // 找到对应的完整关键词
                    const matchedKeyword = searchHistory.find(item => 
                        item.startsWith(keyword.substring(0, keyword.length - 3)));
                    if (matchedKeyword) {
                        fullKeyword = matchedKeyword;
                    }
                }
                document.getElementById('searchInput').value = fullKeyword;
                const filteredSites = searchSites(fullKeyword);
                renderSites(filteredSites);
            });
        });
        
        // 绑定删除按钮事件
        searchHistoryContainer.querySelectorAll('.remove-btn').forEach(button => {
            button.addEventListener('click', function() {
                const keyword = this.getAttribute('data-keyword');
                removeFromSearchHistory(keyword);
            });
        });
        
        // 绑定全部清除按钮事件
        clearAllBtn.addEventListener('click', function() {
            clearAllSearchHistory();
        });
    }
}

// 从搜索历史中移除
function removeFromSearchHistory(keyword) {
    searchHistory = searchHistory.filter(item => item !== keyword);
    // 保存到本地存储
    localStorage.setItem('navoSearchHistory', JSON.stringify(searchHistory));
    renderSearchHistory();
}

// 清除所有搜索历史
function clearAllSearchHistory() {
    searchHistory = [];
    // 保存到本地存储
    localStorage.setItem('navoSearchHistory', JSON.stringify(searchHistory));
    renderSearchHistory();
    // 重新渲染所有站点
    renderSites(sampleSites);
}

// 快捷搜索功能（现在改为搜索历史功能）
function setupQuickSearch() {
    // 页面加载时从本地存储恢复搜索历史（如果有的话）
    const savedHistory = localStorage.getItem('navoSearchHistory');
    if (savedHistory) {
        searchHistory = JSON.parse(savedHistory);
        renderSearchHistory();
    }
}

// 动态占位符动画
function animatePlaceholder() {
    const placeholderElement = document.getElementById('dynamicPlaceholder');
    if (!placeholderElement) return;
    
    const currentText = placeholderTexts[placeholderIndex];
    
    if (isDeleting) {
        // 删除文字
        currentPlaceholder = currentText.substring(0, charIndex - 1);
        charIndex--;
    } else {
        // 添加文字
        currentPlaceholder = currentText.substring(0, charIndex + 1);
        charIndex++;
    }
    
    placeholderElement.textContent = currentPlaceholder;
    
    // 判断是否需要切换到删除模式或下一个文本
    let typingSpeed = 150;
    
    if (!isDeleting && currentPlaceholder === currentText) {
        // 当前文本显示完毕，等待一段时间后开始删除
        typingSpeed = 2000;
        isDeleting = true;
    } else if (isDeleting && currentPlaceholder === '') {
        // 当前文本删除完毕，切换到下一个文本
        isDeleting = false;
        placeholderIndex = (placeholderIndex + 1) % placeholderTexts.length;
        typingSpeed = 500;
    }
    
    placeholderTimer = setTimeout(animatePlaceholder, typingSpeed);
}

// 重置搜索功能
function setupResetButton() {
    const resetBtn = document.getElementById('resetBtn');
    const searchInput = document.getElementById('searchInput');
    
    if (resetBtn && searchInput) {
        resetBtn.addEventListener('click', function() {
            searchInput.value = '';
            renderSites(sampleSites);
            searchInput.focus();
        });
    }
}

// 顶栏工具功能
function setupTopToolbar() {
    // 页面切换按钮
    const homeBtn = document.querySelector('.page-slider-btn');
    const adminBtn = document.getElementById('adminBtn');
    
    if (homeBtn) {
        homeBtn.addEventListener('click', function() {
            // 移除所有按钮的active类
            document.querySelectorAll('.page-slider-btn, .admin-btn').forEach(btn => 
                btn.classList.remove('active'));
            // 为当前按钮添加active类
            this.classList.add('active');
        });
    }
    
    if (adminBtn) {
        adminBtn.addEventListener('click', function() {
            // 移除所有按钮的active类
            document.querySelectorAll('.page-slider-btn, .admin-btn').forEach(btn => 
                btn.classList.remove('active'));
            // 为当前按钮添加active类
            this.classList.add('active');
            window.location.href = '/admin.html';
        });
    }
}

// 初始化页面
document.addEventListener('DOMContentLoaded', function() {
    // 渲染所有站点
    renderSites(sampleSites);
    
    // 设置快捷搜索
    setupQuickSearch();
    
    // 设置重置按钮
    setupResetButton();
    
    // 设置顶栏工具
    setupTopToolbar();
    
    // 启动动态占位符动画
    animatePlaceholder();
    
    // 搜索功能
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    
    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            const keyword = searchInput.value.trim();
            const filteredSites = searchSites(keyword);
            renderSites(filteredSites);
        });
    }
    
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const keyword = searchInput.value.trim();
                const filteredSites = searchSites(keyword);
                renderSites(filteredSites);
            }
        });
    }
    
    // 点击模态框外部关闭模态框
    window.onclick = function(event) {
        const detailModal = document.getElementById('detailModal');
        const commentModal = document.getElementById('commentModal');
        
        if (detailModal && event.target === detailModal) {
            closeModal('detailModal');
        }
        
        if (commentModal && event.target === commentModal) {
            closeModal('commentModal');
        }
    };
});

// 复制文本到剪贴板
function copyText(textarea) {
    textarea.select();
    document.execCommand('copy');
    
    // 显示复制成功提示
    const originalBackground = textarea.style.backgroundColor;
    textarea.style.backgroundColor = '#d4edda';
    setTimeout(() => {
        textarea.style.backgroundColor = originalBackground;
    }, 500);
}
