// Admin模块
const Admin = (function() {
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

    // DOM元素缓存
    const elements = {
        siteGrid: null,
        siteForm: null,
        editSiteForm: null
    };

    // 初始化函数
    function init() {
        // 缓存DOM元素
        cacheDOMElements();
        
        // 绑定事件
        bindEvents();
        
        // 渲染所有站点
        renderSites(sites);
        
        // 初始化用户界面状态
        updateUserUIState();
    }

    // 缓存DOM元素
    function cacheDOMElements() {
        elements.siteGrid = document.getElementById('adminSiteGrid');
        elements.siteForm = document.getElementById('siteForm');
        elements.editSiteForm = document.getElementById('editSiteForm');
        elements.uploadForm = document.getElementById('uploadForm');
        elements.parseResult = document.getElementById('parseResult');
        elements.importSection = document.getElementById('importSection');
        elements.markdownOutput = document.getElementById('markdownOutput');
        elements.importBtn = document.getElementById('importBtn');
    }

    // 绑定事件
    function bindEvents() {
        // 添加站点表单提交事件
        if (elements.siteForm) {
            elements.siteForm.addEventListener('submit', handleSiteFormSubmit);
        }
        
        // 编辑站点表单提交事件
        if (elements.editSiteForm) {
            elements.editSiteForm.addEventListener('submit', handleEditSiteFormSubmit);
        }
        
    }

    // 处理添加站点表单提交
    function handleSiteFormSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(elements.siteForm);
        const siteData = {
            url: formData.get('siteUrl'),
            reviews: [
                {
                    content: formData.get('siteReview')
                }
            ],
            tags: formData.get('siteTags').split(',').map(tag => tag.trim()).filter(tag => tag),
            status: formData.get('siteStatus')
        };
        
        saveSite(siteData);
        renderSites(sites);
        
        // 重置表单并返回列表页面
        elements.siteForm.reset();
        switchToPage('site-management');
    }

    // 处理编辑站点表单提交
    function handleEditSiteFormSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(elements.editSiteForm);
        const siteData = {
            id: parseInt(formData.get('editSiteId')),
            url: formData.get('editSiteUrl'),
            reviews: [
                {
                    content: formData.get('editSiteReview')
                }
            ],
            tags: formData.get('editSiteTags').split(',').map(tag => tag.trim()).filter(tag => tag),
            status: formData.get('editSiteStatus')
        };
        
        saveSite(siteData);
        renderSites(sites);
        
        // 返回列表页面
        switchToPage('site-management');
    }


    // 切换页面
    function switchToPage(pageName) {
        // 隐藏所有页面
        document.querySelectorAll('.admin-page').forEach(page => {
            page.classList.remove('active');
        });
        
        // 显示目标页面
        const targetPage = document.getElementById(`${pageName}-page`);
        if (targetPage) {
            targetPage.classList.add('active');
        }
        
        // 更新导航按钮状态
        document.querySelectorAll('.admin-nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const targetNavBtn = document.querySelector(`.admin-nav-btn[data-page="${pageName}"]`);
        if (targetNavBtn) {
            targetNavBtn.classList.add('active');
        }
    }

    // 渲染站点卡片
    function renderSites(sites) {
        if (!elements.siteGrid) return;
        
        if (sites.length === 0) {
            elements.siteGrid.innerHTML = '<p class="empty-placeholder">暂无站点数据</p>';
            return;
        }
        
        elements.siteGrid.innerHTML = '';
        
        sites.forEach(site => {
            const card = createSiteCard(site);
            elements.siteGrid.appendChild(card);
        });
        
        // 绑定编辑和删除事件
        bindSiteCardEvents();
    }

    // 创建站点卡片
    function createSiteCard(site) {
        const card = document.createElement('div');
        card.className = 'site-card';
        
        // 构建评价气泡HTML
        let reviewsHtml = '';
        site.reviews.forEach(review => {
            reviewsHtml += `
                <div class="review-bubble">
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
                <button class="edit-btn" data-id="${site.id}">
                    <i data-feather="edit"></i>
                    编辑
                </button>
                <button class="delete-btn" data-id="${site.id}">
                    <i data-feather="trash"></i>
                    删除
                </button>
            </div>
        `;
        
        return card;
    }

    // 绑定站点卡片事件
    function bindSiteCardEvents() {
        // 初始化feather icons
        feather.replace();
        
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
        
        // 填充表单数据
        document.getElementById('editSiteId').value = site.id;
        document.getElementById('editSiteUrl').value = site.url;
        document.getElementById('editSiteReview').value = site.reviews[0]?.content || '';
        document.getElementById('editSiteTags').value = site.tags.join(', ');
        document.getElementById('editSiteStatus').value = site.status;
        
        // 切换到编辑页面
        switchToPage('edit-site');
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


    // 更新用户界面状态
    function updateUserUIState() {
        // 这里可以添加更新用户界面状态的逻辑
    }

    // 公共API
    return {
        init: init,
        getSites: () => sites,
        renderSites: renderSites
    };
})();

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    Admin.init();
});