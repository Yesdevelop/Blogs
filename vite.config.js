import { defineConfig } from "vite";
import { ViteEjsPlugin as createEjsPlugin } from "vite-plugin-ejs";

export default defineConfig({
    plugins: [
        createEjsPlugin({
            author: "ForYes",
            bio: "Make it Awesome",
            sitetitle: "ForYes",
            subtitle: "Years rolling by just like a dream",
            posts: [
                {title: "fuck", tags: ["you"], date: "2020", preview: "i want to fuck you"},
                {title: "fuck", tags: ["you"], date: "2020", preview: "i want to fuck you"},
                {title: "fuck", tags: ["you"], date: "2020", preview: "i want to fuck you"},
                {title: "fuck", tags: ["you"], date: "2020", preview: "i want to fuck you"},
                {title: "fuck", tags: ["you"], date: "2020", preview: "i want to fuck you"},
                {title: "fuck", tags: ["you"], date: "2020", preview: "i want to fuck you"},
                {title: "fuck", tags: ["you"], date: "2020", preview: "i want to fuck you"},
                {title: "fuck", tags: ["you"], date: "2020", preview: "i want to fuck you"},
                {title: "fuck", tags: ["you"], date: "2020", preview: "i want to fuck you"},
                {title: "fuck", tags: ["you"], date: "2020", preview: "i want to fuck you"},
                {title: "fuck", tags: ["you"], date: "2020", preview: "i want to fuck you"},
            ],
            postNumber: 0,
            tagNumber: 0,
            dayNumber: 0,
            lastUpdateDate: "2026/1/1",
        }),
    ],
    build: {
        outDir: "./docs",
    },
});
