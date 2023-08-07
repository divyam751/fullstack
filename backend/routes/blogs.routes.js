const { Router } = require("express");

const { BlogModel } = require("../models/Blog.model");
const { UserModel } = require("../models/User.model");

const blogRouter = Router();

blogRouter.get("/", async (req, res) => {
  const blogs = await BlogModel.find();
  res.send({ blogs: blogs });
});

blogRouter.post("/create", async (req, res) => {
  const { title, description } = req.body;
  const author_id = req.user_id;
  const user = await UserModel.findOne({ _id: author_id });
  const new_blog = new BlogModel({
    title,
    description,
    author_name: user.name,
    author_email: user.email,
  });
  await new_blog.save();
  res.send("blog created");
});
blogRouter.put("/edit/:blogID", (req, res) => {
  res.send("blog edited");
});
blogRouter.delete("/delete/:blogID", (req, res) => {
  res.send("blog deleted");
});

module.exports = { blogRouter };
