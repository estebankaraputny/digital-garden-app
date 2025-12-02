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
            const errorData = await post.json().catch(() => ({}));
            
            let errorMessage = "Ocurrió un error desconocido";

            if (errorData.message) {
                // Si es un array (varios errores), los unimos. Si es texto, lo usamos directo.
                errorMessage = Array.isArray(errorData.message) 
                    ? errorData.message.join(', ') 
                    : errorData.message;
            }

            console.log(errorMessage);


            //error con EL TEXTO REAL del backend
            throw new Error(errorMessage);
        }

        // const dataPost = await post.json();
        return await post.json();

    } catch (error: any) {
        throw new Error(error || "Error de conexión :|")
    }
}

export default fetchDataPost;