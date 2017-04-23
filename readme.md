# hexo-ipynb

A hexo plugin which allow embed iPython notebook into post.

### Install

`npm install --save hexo-ipynb`

### Usage

1. Enable post asset by adding this line in your `_config.yml`: `post_asset_folder: true`
2. Put your .ipynb file into the post asset folder
3. Reference the notebook in your post: `{% asset_ipynb <example.ipynb> %}`
