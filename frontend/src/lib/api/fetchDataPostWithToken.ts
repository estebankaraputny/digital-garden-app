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
            const errorData = await post.json().catch(() => ({}));
            
            let errorMessage = "Ocurrió un error desconocido";

            if (errorData.message) {
                errorMessage = Array.isArray(errorData.message) 
                    ? errorData.message.join(', ') 
                    : errorData.message;
            }

            console.log(errorMessage);
            throw new Error(errorMessage);
        }
        
        return await post.json();

    } catch (error: any) {
        throw new Error(error || "Error de conexión :|")
    }
}

export default fetchDataPostWithToken;