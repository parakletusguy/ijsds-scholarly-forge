export const spellCheck = async (text) => {
    try {
        const checkArray = await fetch('https://language-tool-6g6e.onrender.com/v2/check', {
            method:'POST',
            headers:{'Content-Type':"application/x-www-form-urlencoded"},
            body:`language=auto&text=${encodeURIComponent(text)}`
        })
        const data = await checkArray.json()
        return data
    } catch (error) {
        if(error)
            throw error
    }
}