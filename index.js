const path = require('path')
const exec = require('co-exec')
const co = require('co')
const fs = require('co-fs')

function processPostAsset(file) {
  return co(function *() {
    const PostAsset = hexo.model('PostAsset')
    const Post = hexo.model('Post')
    const id = file.source.substring(hexo.base_dir.length).replace(/\\/g, '/')
    const doc = PostAsset.findById(id)

    const post = Post.findById(doc.post)
    if (!post) {
      return
    }

    if (file.type !== 'skip') {
      post.updated = new Date(0)
      post.save()
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
      maxBuffer: 5 * 1024 * 1024
    })

    return html
  })

}, {
  async: true,
  ends: false
})
