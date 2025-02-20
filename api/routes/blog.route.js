import express from 'express';
import { createBlog, deleteBlog, editBlog, getAllJobs, getBlogById, getBlogsByCreator } from '../controller/blog.controller.js';


const router = express.Router()


router.post('/create',createBlog)
router.get('/blogs',getAllJobs)
router.get('/blogs/:id',getBlogById)
router.get('/fetch',getBlogsByCreator)

router.patch('/edit/:id',editBlog)
router.delete('/delete/:id',deleteBlog)




export default router