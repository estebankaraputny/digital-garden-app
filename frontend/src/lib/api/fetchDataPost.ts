const DataUrl = import.meta.env.PUBLIC_API_URL;


const fetchDataPost = async (endpoint: string, data: any) =>{
    try {
        const post = await fetch(`${DataUrl}/${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
            cache: 'no-store',
        })

        
        if(!post.ok){
            const errorMessage = await post.json().catch(() => ({}));
            throw new Error(errorMessage || "Error en el post :Ñ");
        }

        // const dataPost = await post.json();
        return await post.json();

    } catch (error: any) {
        throw new Error(error || "Error function post :|")
    }
}

export default fetchDataPost;