const Post = require("./../model/Post.model");
const User = require("./../model/User.model");
const multer = require("multer");

//configure multer storage
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/img/posts");
  },
  filename: (req, file, cb) => {
    //get file extension
    const ext = file.mimetype.split("/")[1];
    cb(null, `post-${req.body.title}.${ext}`);
  },
});

//configure multer filter which will check if uploaded file is an image
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new Error("Not an image. Please upload an image", false));
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

//multer middleware for image upload
exports.uploadCoverPhoto = upload.single("coverPhoto");

//get all post
// exports.getAllPublishedPost = async (req, res) => {
//   //define possible queries
//   const { query } = req;

//   const { author, title, tags } = query;

//   //build search query object to be able to filter results based on the query
//   const searchQuery = {};

//   if (author) {
//     searchQuery.author = author;
//   }

//   if (title) {
//     searchQuery.title = title;
//   }

//   if (tags) {
//     searchQuery.tags = tags;
//   }

//   try {
//     const posts = await Post.find({
//       author: { $regex: new RegExp(searchQuery.author, "i") },
//       title: { $regex: new RegExp(searchQuery.title, "i") },
//       tags: { $regex: new RegExp(searchQuery.tags, "i") },
//       state: "published",
//     });
    
//     res.status(200).json({
//       status: "success",
//       posts,
//     });
//   } catch (err) {
//     throw err;
//   }
// };

exports.getAllPublishedPost = async (req, res) => {
  try {
    const { author, title, tags, page = 1, limit = 20 } = req.query;

    // Build dynamic filter
    const searchQuery = {
      state: "published",
    };

    if (author) {
      searchQuery.author = { $regex: new RegExp(author, "i") };
    }

    if (title) {
      searchQuery.title = { $regex: new RegExp(title, "i") };
    }

    if (tags) {
      searchQuery.tags = { $regex: new RegExp(tags, "i") };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [posts, total] = await Promise.all([
      Post.find(searchQuery)
        .sort({ createdAt: -1 }) // descending
        .skip(skip)
        .limit(Number(limit)),
      Post.countDocuments(searchQuery),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      status: "success",
      currentPage: Number(page),
      totalPages,
      totalPosts: total,
      results: posts.length,
      posts,
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message || "Something went wrong while fetching posts",
    });
  }
};

exports.getASinglePublishedPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId)
      .where("state")
      .eq("published");

    if (!post) {
      return res.status(404).json({
        status: "Failed",
        message: "Post with given Id not found",
      });
    } else {
      //increment the `readCount` property
      post.readCount === 0 ? post.readCount++ : post.readCount++;
      await post.save();
    }

    res.status(200).json({
      status: "success",
      post,
    });
  } catch (err) {
    throw err;
  }
};

exports.createAPost = async (req, res) => {
  try {
    const { title, description, tags, body } = req.body;

    //calculate read time of post from the body passed in
    const wpm = 225;
    const numOfWords = body.trim().split(/\s+/).length;
    const readTime = Math.ceil(numOfWords / wpm) + " mins";

    //get author name and author Id
    let { firstname, lastname } = req.user;

    let author = `${firstname} ${lastname}`;
    let authorId = req.user._id;

    //add cover photo for a post
    let coverPhoto;
    if(req.file){
      coverPhoto = req.file.filename
    }

    const post = await Post.create({
      title,
      description,
      tags,
      body,
      author,
      authorId,
      readTime,
      coverPhoto
    });

    //add created post to 'posts' array property on the user document
    let user = await User.findById(req.user._id);
    user.posts.push(post._id);
    await user.save(); //save changes made to the user doc

    res.status(201).json({
      status: "success",
      post,
    });
  } catch (err) {
    throw err;
  }
};

exports.updateAPost = async (req, res) => {
  const { state, body, title, tags, description } = req.body;
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.postId,
      {
        $set: { state, body, title, tags, description },
      },
      { new: true }
    );

    //check if post belongs to a appropriate author
    if (post.authorId.toString() !== req.user.id) {
      console.log(req.user.id);
      return res.status(401).json({
        status: "Fail",
        message: `You can only update a post you created!`,
      });
    }

    res.status(200).json({
      status: "success",
      post,
    });
  } catch (err) {
    throw err;
  }
};

exports.deleteAPost = async (req, res) => {
  try {
    const post = await Post.findByIdAndRemove(req.params.postId, {
      authorId: req.user.id,
    });
    if (!post)
      return res.status(404).json({
        status: "Fail",
        message: "Post with given Id not found",
      });

    if (post.authorId.toString() !== req.user.id) {
      return res.status(401).json({
        status: "Fail",
        message: `You can only delete a post you created!`,
      });
    }

    //delete post from user's 'posts' array in user model
    const postByUser = await User.findById(req.user._id);
    postByUser.posts.pull(post._id);
    await postByUser.updateOne({ posts: postByUser.posts });

    //return deleted post
    res.status(200).json({
      status: "success",
      message: "Post deleted successfully",
    });
  } catch (err) {
    throw err;
  }
};
