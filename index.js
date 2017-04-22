const path = require('path')
const exec = require('co-exec')
const co = require('co')
const fs = require('co-fs')
const minimist = require('minimist')

function processAsset(file) {
  return co(function *() {
    const id = file.source.substring(hexo.base_dir.length).replace(/\\/g, '/')

    const htmlSource = path.join(path.dirname(file.source), '_' + path.basename(file.source) + '.html')
    const htmlPath = path.join(path.dirname(file.path), '_' + path.basename(file.path) + '.html')
    const htmlId = htmlSource.substring(hexo.base_dir.length).replace(/\\/g, '/')

    const Asset = hexo.model('Asset')

    const doc = Asset.findById(id)
    const htmlDoc = Asset.findById(htmlId)

    if (file.type === 'delete') {
      yield [
        doc ? doc.remove() : null,
        htmlDoc ? htmlDoc.remove() : null
      ]
      if (yield fs.existsSync(htmlSource)) {
        yield fs.unlinkSync(htmlSource)
      }
      return
    }

    if (file.type !== 'skip') {
      yield exec(`jupyter nbconvert "${file.source}" --output="${htmlSource}"`)
    }

    yield [
      Asset.save({
        _id: id,
        path: file.path,
        modified: file.type !== 'skip',
        renderable: false
      }),
      Asset.save({
        _id: htmlId,
        path: htmlPath,
        modified: file.type !== 'skip',
        renderable: false
      }),
    ]
  })
}

function processPostAsset(file) {
  return co(function *() {
    const PostAsset = hexo.model('PostAsset')
    const Post = hexo.model('Post')
    const id = file.source.substring(hexo.base_dir.length).replace(/\\/g, '/')
    const doc = PostAsset.findById(id)

    const htmlSource = path.join(path.dirname(file.source), '_' + path.basename(file.source) + '.html')
    const htmlPath = path.join(path.dirname(file.path), '_' + path.basename(file.path) + '.html')
    const htmlId = htmlSource.substring(hexo.base_dir.length).replace(/\\/g, '/')
    const htmlDoc = PostAsset.findById(htmlId)

    if (file.type === 'delete') {
      yield [
        doc ? doc.remove() : null,
        htmlDoc ? htmlDoc.remove() : null
      ]
      if (yield fs.existsSync(htmlSource)) {
        yield fs.unlinkSync(htmlSource)
      }
      return
    }

    if (file.type !== 'skip') {
      yield exec(`jupyter nbconvert "${file.source}" --output="${htmlSource}"`)
    }

    // TODO: Better post searching
    var posts = Post.toArray()
    var post

    for (var i = 0, len = posts.length; i < len; i++) {
      post = posts[i]

      if (file.source.startsWith(post.asset_dir)) {
        yield [
          PostAsset.save({
            _id: id,
            slug: file.source.substring(post.asset_dir.length),
            post: post._id,
            modified: file.type !== 'skip',
            renderable: false
          }),
          PostAsset.save({
            _id: htmlId,
            slug: htmlSource.substring(post.asset_dir.length),
            post: post._id,
            modified: file.type !== 'skip',
            renderable: false
          })
        ]
        return
      }
    }
  })
}

hexo.extend.processor.register(/\.ipynb$/, function (file) {
  if (file.path.startsWith('_posts/') || file.path.startsWith('_drafts/')) {
    return processPostAsset(file)
  }
  return processAsset(file)
})

hexo.extend.tag.register('asset_ipynb', function (args) {
  let options = {
    download: true
  }
  args = minimist(args)
  options = Object.assign(options, args)
  args = args._
  let title = args[1]

  let data = `<iframe src="./_${args[0]}.html" frameborder="0" style="width=100%"
onload="(function (t){ t.style.height = 0; t.style.width = '100%'; t.style.height = (t.contentWindow.document.body.scrollHeight + 20) + 'px';})(this)">
</iframe>`
  if (options.download) {
    return `<p style="margin-bottom:0"><a href="./${args[0]}">${title || args[0]}</a></p>` + data
  } else if (title) {
    return `<p style="margin-bottom:0">${title}</p>` + data
  } else {
    return data
  }

}, {
  async: false,
  ends: false
})
