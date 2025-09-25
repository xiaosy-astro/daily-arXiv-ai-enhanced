# 🚀 daily-arXiv-ai-enhanced

#### 1. Fork 仓库
	
- 	打开你要用的那个项目仓库
- 	点击右上角的 Fork，把它 fork 到你自己的 GitHub 账号下。


#### 2. 配置 Secrets（敏感信息）
	
- 1.	打开你 fork 后的仓库：
your-username/daily-arXiv-ai-enhanced
- 2.	点击 Settings → Secrets and variables → Actions。
- 3.	在 Secrets 里点击 New repository secret，创建两个：

	•	OPENAI_API_KEY → 你的 OpenAI API key

	•	OPENAI_BASE_URL → 你的 OpenAI API base url


#### 3. 配置 Variables（非敏感信息）

同样在 Settings → Secrets and variables → Actions → Variables，新建以下变量：

   •	CATEGORIES → 比如 cs.CL, cs.CV
   
	
   •	LANGUAGE → 比如 Chinese 或 English
	
   •	MODEL_NAME → 比如 deepseek-chat 或 gpt-4o-mini
	
   •	EMAIL → 你的 GitHub 邮箱（用来提交 commit）
	
   •	NAME → 你的 GitHub 用户名（用来提交 commit）


#### 4. 运行 GitHub Action

- 1.在仓库页面，点击 Actions。
- 2.	找到 arXiv-daily-ai-enhanced workflow。
- 3.	点击 Run workflow → Run workflow（手动触发一次，可能需要 ~1 小时）。
- 4.	默认情况下它会每天自动运行一次，你也可以在 .github/workflows/run.yml 修改 cron 定时规则。



#### 5. 部署 GitHub Pages
	
- 1.	打开 Settings → Pages。
- 2.	在 Build and deployment 里：
  
	•	Source → 选择 Deploy from a branch

	•	Branch → 选择 main

	•	Folder → 选择 / (root)

#### 3.	等几分钟，访问：

https://<你的 GitHub 用户名>.github.io/daily-arXiv-ai-enhanced/
