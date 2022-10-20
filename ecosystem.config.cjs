module.exports = {
    apps: [
        {
            name: "NECos",
            script: "./build/NECos.js"
        }
    ],
    deploy: {
        production: {
            user: "deploy",
            host: "ssh.imskyyc.xyz:5622",
            key: "deploy.key",
            ref: "origin/master",
            repo: "https://github.com/Nuclear-Engineering-Co/NECos",
            path: "/srv/NECos",
            'post-deploy': 'git pull && npm run build && pm2 restart build/NECos.js',
            env: {
                NODE_ENV: 'production'
            }
        }
    }
}
