const path = require('path')
const exec = require('co-exec')
const co = require('co')
const fs = require('co-fs')

function findPostFromAsset(file) {
  const Post = hexo.model('Post')
  const posts = Post.toArray()

  for (var i = 0, len = posts.length; i < len; i++) {
    let post = posts[i]
    if (file.source.startsWith(post.asset_dir)) {
      return post
    }
  }
}

function processPostAsset(file) {
  return co(function *() {
    if (file.type !== 'skip') {
      let post = findPostFromAsset(file)
      if (post) {
        post.updated = new Date(0)
        post.save()
      }
    }
  })
}

hexo.extend.processor.register(/\.ipynb$/, function (file) {
  if (file.path.startsWith('_posts/') || file.path.startsWith('_drafts/')) {
    return processPostAsset(file)
  }
})

const PY_SCRIPT = path.join(__dirname, 'convert.py')

hexo.extend.tag.register('asset_ipynb', function (args) {
  const post = this
  return co(function *() {
    const ipynbFile = path.join(post.asset_dir, args[0])

    let html = yield exec(`python ${PY_SCRIPT} ${ipynbFile}`, {
      maxBuffer: 5 * 1024 * 1024,
      env: {
        PYTHONIOENCODING: 'utf8'
      }
    })

    return html
  })

}, {
  async: true,
  ends: false
})
