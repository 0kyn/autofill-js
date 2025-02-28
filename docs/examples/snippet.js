(async () => {
  const highlight = (element, code) => {
    element.textContent = code
    window.hljs.highlightElement(element)
  }

  const getUrlContent = async url => {
    const response = await fetch(url)
    const content = await (response).text()

    return content
  }

  const renderSnippets = async () => {
    const snippets = document.querySelectorAll('.js-snippet')
    const baseUrl = '/examples/snippets'
    for (const snippet of snippets) {
      const dataSnippet = snippet.getAttribute('data-snippet')
      if (dataSnippet) {
        const snippetContent = await getUrlContent(`${baseUrl}/${dataSnippet}`)
        highlight(snippet, snippetContent)
      }
    }
  }
  await renderSnippets()

})()
