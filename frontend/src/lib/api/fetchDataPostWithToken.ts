const DataUrl = import.meta.env.PUBLIC_API_URL;


const fetchDataPostWithToken = async (endpoint: string, data: any, token: string) =>{
    try {
        const post = await fetch(`${DataUrl}/${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data),
        })

        
        if(!post.ok){
            const errorMessage = await post.json().catch(() => ({}));
            throw new Error(errorMessage || "Error en el post :Ñ");
        }

        return await post.json();

    } catch (error: any) {
        throw new Error(error || "Error function post :|")
    }
}

export default fetchDataPostWithToken;