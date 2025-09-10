// 站点数据示例（实际项目中会从API获取）
let sites = [
    {
        id: 1,
        url: "https://www.remove.bg",
        reviews: [
            {
                user: "张三",
                content: "一个非常好用的在线抠图工具，能快速移除图片背景，支持透明背景下载。"
            },
            {
                user: "李四",
                content: "处理效果很棒，特别是对于头发丝的处理很自然，比其他免费工具好用多了。"
            }
        ],
        tags: ["图片处理", "设计"],
        status: "public",
        createdAt: "2025-09-01"
    },
    {
        id: 2,
        url: "https://github.com",
        reviews: [
            {
                user: "王五",
                content: "全球最大的代码托管平台，支持Git版本控制，可以托管代码、管理项目。"
            }
        ],
        tags: ["开发", "代码托管"],
        status: "public",
        createdAt: "2025-08-20"
    }
];

// 渲染站点卡片
function renderSites(sites) {
    const siteGrid = document.getElementById('adminSiteGrid');
    siteGrid.innerHTML = '';
    
    sites.forEach(site => {
        const card = document.createElement('div');
        card.className = 'site-card';
        
        // 构建评价气泡HTML
        let reviewsHtml = '';
        site.reviews.forEach(review => {
            reviewsHtml += `
                <div class="review-bubble">
                    <div class="review-user">${review.user}</div>
                    <div class="review-content">${review.content}</div>
                </div>
            `;
        });
        
        // 构建标签HTML
        let tagsHtml = '';
        if (site.tags && site.tags.length > 0) {
            tagsHtml = `
                <div class="site-card-tags">
                    <div class="tag-list">
                        ${site.tags.map(tag => `<span class="tag-item">${tag}</span>`).join('')}
                    </div>
                </div>
            `;
        }
        
        card.innerHTML = `
            <div class="site-card-header">
                <a href="${site.url}" target="_blank" class="site-card-url">${site.url}</a>
            </div>
            <div class="site-card-body">
                ${reviewsHtml}
            </div>
            ${tagsHtml}
            <div class="site-card-actions">
                <button class="edit-btn" data-id="${site.id}">编辑</button>
                <button class="delete-btn" data-id="${site.id}">删除</button>
            </div>
        `;
        siteGrid.appendChild(card);
    });
    
    // 绑定编辑和删除事件
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = parseInt(this.getAttribute('data-id'));
            editSite(id);
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = parseInt(this.getAttribute('data-id'));
            deleteSite(id);
        });
    });
}

// 编辑站点
function editSite(id) {
    const site = sites.find(s => s.id === id);
    if (!site) return;
    
    document.getElementById('siteUrl').value = site.url;
    document.getElementById('siteReview').value = site.reviews[0]?.content || '';
    document.getElementById('siteTags').value = site.tags.join(', ');
    document.getElementById('siteStatus').value = site.status;
    
    // 滚动到表单顶部
    document.querySelector('.admin-section').scrollIntoView({ behavior: 'smooth' });
}

// 删除站点
function deleteSite(id) {
    if (confirm('确定要删除这个站点吗？')) {
        sites = sites.filter(site => site.id !== id);
        renderSites(sites);
    }
}

// 添加/更新站点
function saveSite(siteData) {
    if (siteData.id) {
        // 更新现有站点
        const index = sites.findIndex(s => s.id === siteData.id);
        if (index !== -1) {
            sites[index] = {...sites[index], ...siteData};
        }
    } else {
        // 添加新站点
        const newSite = {
            ...siteData,
            id: Math.max(0, ...sites.map(s => s.id)) + 1,
            createdAt: new Date().toISOString().split('T')[0]
        };
        sites.push(newSite);
    }
    
    return sites;
}

// 解析书签文件
function parseBookmarkFile(content) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    
    // 查找所有书签链接
    const links = doc.querySelectorAll('a[href]');
    const bookmarks = [];
    
    links.forEach(link => {
        const url = link.getAttribute('href');
        const title = link.textContent || link.getAttribute('title') || url;
        
        // 获取父级文件夹名称作为标签
        let tags = [];
        const parentDL = link.closest('dl');
        if (parentDL) {
            const prevDT = parentDL.previousElementSibling;
            if (prevDT && prevDT.tagName === 'DT') {
                const folderName = prevDT.textContent || '';
                if (folderName) {
                    tags.push(folderName);
                }
            }
        }
        
        bookmarks.push({
            title: title,
            url: url,
            tags: tags
        });
    });
    
    return bookmarks;
}

// 转换为Markdown格式
function convertToMarkdown(bookmarks) {
    let markdown = "";
    
    bookmarks.forEach((bookmark, index) => {
        markdown += `## 站点 ${index + 1}\n\n`;
        markdown += `- **网址**: [${bookmark.url}](${bookmark.url})\n`;
        markdown += `- **评价**: 请在这里添加您对这个站点的评价\n`;
        if (bookmark.tags.length > 0) {
            markdown += `- **标签**: ${bookmark.tags.join(', ')}\n`;
        }
        markdown += "\n";
    });
    
    return markdown;
}

// 模拟导入数据库功能
function importToDatabase(markdownContent) {
    // 这里应该是实际的数据库导入逻辑
    console.log('导入到数据库的内容:', markdownContent);
    
    // 模拟导入过程
    alert('书签已成功导入数据库！');
    
    // 清空导入区域
    document.getElementById('markdownOutput').value = '';
    document.getElementById('importSection').style.display = 'none';
    document.getElementById('parseResult').innerHTML = '<p>请上传书签文件以查看解析结果</p>';
    
    // 重新渲染站点列表
    renderSites(sites);
}

// 初始化页面
document.addEventListener('DOMContentLoaded', function() {
    // 渲染所有站点
    renderSites(sites);
    
    // 表单提交事件
    const siteForm = document.getElementById('siteForm');
    if (siteForm) {
        siteForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const siteData = {
                url: formData.get('siteUrl'),
                reviews: [
                    {
                        user: "当前用户",
                        content: formData.get('siteReview')
                    }
                ],
                tags: formData.get('siteTags').split(',').map(tag => tag.trim()).filter(tag => tag),
                status: formData.get('siteStatus')
            };
            
            saveSite(siteData);
            renderSites(sites);
            
            // 重置表单
            siteForm.reset();
        });
    }
    
    // 书签上传表单事件
    const uploadForm = document.getElementById('uploadForm');
    const parseResult = document.getElementById('parseResult');
    const importSection = document.getElementById('importSection');
    const markdownOutput = document.getElementById('markdownOutput');
    const importBtn = document.getElementById('importBtn');
    
    if (uploadForm) {
        uploadForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const fileInput = document.getElementById('bookmarkFile');
            const file = fileInput.files[0];
            
            if (!file) {
                alert('请选择一个书签文件');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const content = e.target.result;
                    const bookmarks = parseBookmarkFile(content);
                    
                    // 显示解析结果
                    parseResult.innerHTML = `
                        <p>成功解析到 ${bookmarks.length} 个书签</p>
                        <ul>
                            ${bookmarks.slice(0, 10).map(b => `<li>${b.title} - ${b.url}</li>`).join('')}
                            ${bookmarks.length > 10 ? `<li>... 还有 ${bookmarks.length - 10} 个书签</li>` : ''}
                        </ul>
                    `;
                    
                    // 转换为Markdown并显示在导入区域
                    const markdown = convertToMarkdown(bookmarks);
                    markdownOutput.value = markdown;
                    
                    // 显示导入区域
                    importSection.style.display = 'block';
                } catch (error) {
                    parseResult.innerHTML = `<p class="error">解析文件时出错: ${error.message}</p>`;
                }
            };
            
            reader.readAsText(file);
        });
    }
    
    // 一键导入数据库
    if (importBtn) {
        importBtn.addEventListener('click', function() {
            const markdownContent = markdownOutput.value;
            if (markdownContent.trim()) {
                importToDatabase(markdownContent);
            } else {
                alert('没有内容可导入');
            }
        });
    }
    
    // 退出登录
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            if (confirm('确定要退出登录吗？')) {
                alert('已退出登录');
                // 这里应该是实际的退出登录逻辑
            }
        });
    }
});