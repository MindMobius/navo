// 从API获取站点数据而不是使用示例数据
let sitesData = [];
let currentSortOrder = 'updated_at_desc'; // 默认排序方式

// 获取站点数据
async function fetchSites() {
    try {
        const response = await fetch('/api/sites');
        if (response.ok) {
            sitesData = await response.json();
            // 处理数据格式，确保reviews字段存在
            sitesData = sitesData.map(site => ({
                ...site,
                reviews: [] // 初始时评论为空，稍后获取
            }));
            return sitesData;
        } else {
            console.error('获取站点数据失败:', response.status);
            return [];
        }
    } catch (error) {
        console.error('获取站点数据时出错:', error);
        return [];
    }
}

// 获取特定站点的评论
async function fetchSiteReviews(suid) {
    try {
        const response = await fetch(`/api/reviews?suid=${suid}`);
        if (response.ok) {
            return await response.json();
        } else {
            console.error(`获取站点${suid}的评论失败:`, response.status);
            return [];
        }
    } catch (error) {
        console.error(`获取站点${suid}的评论时出错:`, error);
        return [];
    }
}

// 为所有站点获取评论
async function fetchAllReviews() {
    const reviewPromises = sitesData.map(site => 
        fetchSiteReviews(site.suid).then(reviews => {
            site.reviews = reviews;
        })
    );
    await Promise.all(reviewPromises);
}

// 获取所有数据（站点和评论）
async function fetchAllData() {
    await fetchSites();
    await fetchAllReviews();
    return sitesData;
}

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
    if (!siteGrid) {
        console.error('无法找到 siteGrid 元素');
        return;
    }
    siteGrid.innerHTML = '';
    
    // 获取Mustache模板
    const templateElement = document.getElementById('site-card-template');
    if (!templateElement) {
        console.error('无法找到 site-card-template 元素');
        return;
    }
    const template = templateElement.innerHTML;
    
    // 对站点进行排序
    const sortedSites = sortSites([...sites], currentSortOrder);
    
    sortedSites.forEach(site => {
        // 初始化当前站点的评论索引为随机索引
        if (siteReviewIndices[site.id] === undefined && site.reviews.length > 0) {
            siteReviewIndices[site.id] = Math.floor(Math.random() * site.reviews.length);
        }
        
        const card = document.createElement('div');
        card.className = 'site-card';
        
        // 获取当前显示的评论
        const currentReviewIndex = site.reviews.length > 0 ? siteReviewIndices[site.id] || 0 : 0;
        const currentReview = site.reviews.length > 0 ? site.reviews[currentReviewIndex] : { content: "暂无评论" };
        
        // 获取网站域名并构造favicon.im URL
        const siteUrl = new URL(site.url);
        const siteIcon = `https://favicon.im/${siteUrl.hostname}`;
        
        // 截断长文本
        const truncateText = (text, maxLength) => {
            if (text.length <= maxLength) {
                return text;
            }
            return text.substring(0, maxLength) + '...';
        };
        
        // 准备模板数据
        const templateData = {
            id: site.id,
            name: site.name,
            url: site.url,
            siteIcon: siteIcon,
            truncatedName: truncateText(site.name, 20),
            truncatedUrl: truncateText(site.url, 40),
            reviewContent: renderMarkdown(currentReview.content),
            reviewCount: site.reviews.length || 0
        };
        
        // 使用Mustache模板渲染
        card.innerHTML = Mustache.render(template, templateData);
        siteGrid.appendChild(card);
    });
    
    // 重新渲染feather图标
    feather.replace();
}

// 站点排序函数
function sortSites(sites, sortOrder) {
    switch (sortOrder) {
        case 'updated_at_desc':
            return sites.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
        case 'updated_at_asc':
            return sites.sort((a, b) => new Date(a.updated_at) - new Date(b.updated_at));
        case 'id_asc':
            return sites.sort((a, b) => a.id - b.id);
        case 'id_desc':
            return sites.sort((a, b) => b.id - a.id);
        case 'review_count_asc':
            return sites.sort((a, b) => (a.reviews?.length || 0) - (b.reviews?.length || 0));
        case 'review_count_desc':
            return sites.sort((a, b) => (b.reviews?.length || 0) - (a.reviews?.length || 0));
        default:
            return sites;
    }
}

// 显示站点详情
function showSiteDetails(siteId) {
    const site = sitesData.find(s => s.id === siteId);
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
    
    // 获取站点详情模板
    const template = document.getElementById('site-detail-template').innerHTML;
    
    // 准备模板数据
    const templateData = {
        id: site.id,
        name: site.name,
        suid: site.suid,
        url: site.url,
        created_at: formatDate(site.created_at),
        updated_at: formatDate(site.updated_at),
        truncatedName: truncateText(site.name, 25)
    };
    
    // 使用Mustache模板渲染
    modal.innerHTML = Mustache.render(template, templateData);
    
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
    const site = sitesData.find(s => s.id === siteId);
    if (!site) return;
    
    const modal = document.createElement('div');
    modal.className = 'modal comment-modal';
    modal.id = 'commentModal';
    
    // 格式化日期
    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleString('zh-CN');
    };
    
    // 获取评论模态框模板
    const template = document.getElementById('comment-modal-template').innerHTML;
    
    // 检查是否有API密钥
    const hasApiKey = !!localStorage.getItem('navo_api_key');
    
    // 准备评论数据
    const reviews = site.reviews.map(review => ({
        content: renderMarkdown(review.content),
        created_at: formatDate(review.created_at || review.updated_at)
    }));
    
    // 准备模板数据
    const templateData = {
        name: site.name.length > 20 ? site.name.substring(0, 20) + '...' : site.name,
        hasReviews: site.reviews.length > 0,
        reviews: reviews,
        hasApiKey: hasApiKey
    };
    
    // 使用Mustache模板渲染
    modal.innerHTML = Mustache.render(template, templateData);
    
    document.body.appendChild(modal);
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // 如果有API密钥，绑定表单提交事件
    if (hasApiKey) {
        document.getElementById('commentForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            const content = document.getElementById('commentContent').value;
            
            if (content) {
                try {
                    // 获取API密钥
                    const apiKey = localStorage.getItem('navo_api_key');
                    
                    // 发送评论到服务器
                    const response = await fetch('/api/reviews', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${apiKey}`
                        },
                        body: JSON.stringify({
                            suid: site.suid,
                            content: content
                        })
                    });
                    
                    if (response.ok) {
                        const newReview = await response.json();
                        
                        // 添加新评论到站点
                        site.reviews.push(newReview);
                        
                        // 关闭模态框
                        closeModal('commentModal');
                        
                        // 重新渲染站点卡片
                        renderSites(sitesData);
                        
                        // 显示成功消息
                        alert('评论添加成功！');
                    } else {
                        const errorData = await response.json();
                        alert(`评论添加失败: ${errorData.error}`);
                    }
                } catch (error) {
                    console.error('添加评论时出错:', error);
                    alert('评论添加失败，请稍后重试');
                }
            }
        });
    } else {
        // 如果没有API密钥，绑定跳转按钮事件
        const goToKeyAuthBtn = document.getElementById('goToKeyAuth');
        if (goToKeyAuthBtn) {
            goToKeyAuthBtn.addEventListener('click', function() {
                closeModal('commentModal');
                window.location.href = '/key-auth.html';
            });
        }
    }
    
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
        return sitesData;
    }
    
    // 添加到搜索历史
    addToSearchHistory(keyword);
    
    return sitesData.filter(site => 
        site.name.toLowerCase().includes(keyword.toLowerCase()) ||
        site.url.toLowerCase().includes(keyword.toLowerCase()) ||
        site.reviews.some(review => 
            review.content.toLowerCase().includes(keyword.toLowerCase())
        )
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
    renderSites(sitesData);
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
            renderSites(sitesData);
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
document.addEventListener('DOMContentLoaded', async function() {
    // 只有在主页(index.html)才获取和渲染站点数据
    // 通过检查是否存在siteGrid元素来判断是否为主页
    const siteGrid = document.getElementById('siteGrid');
    if (siteGrid) {
        // 获取所有数据
        await fetchAllData();
        
        // 渲染所有站点
        renderSites(sitesData);
        
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
        
        // 排序功能
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) {
            sortSelect.addEventListener('change', function() {
                currentSortOrder = this.value;
                renderSites(sitesData);
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
    }
});

// 复制文本到剪贴板
function copyText(textarea) {
    textarea.select();
    document.execCommand('copy');
    
    // 显示复制成功提示
    const originalBackground = textarea.style.backgroundColor;
    const originalTransition = textarea.style.transition;
    textarea.style.transition = 'background-color 0.3s ease';
    textarea.style.backgroundColor = '#e3f2fd'; // 使用更美观的浅蓝色替代绿色
    textarea.style.boxShadow = '0 0 8px rgba(33, 150, 243, 0.3)'; // 添加蓝色光晕效果
    
    setTimeout(() => {
        textarea.style.backgroundColor = originalBackground;
        textarea.style.boxShadow = 'none';
        textarea.style.transition = originalTransition;
    }, 500);
}

// 页面滑块功能
document.addEventListener('DOMContentLoaded', function() {
    updateKeyStatusIndicator();
});

function updateKeyStatusIndicator() {
    const keyIndicator = document.getElementById('keyStatusIndicator');
    if (keyIndicator) {
        const hasKey = localStorage.getItem('navo_api_key');
        keyIndicator.classList.add(hasKey ? 'active' : 'inactive');
    }
}