const DataUrl = import.meta.env.PUBLIC_API_URL;

const fetchDataPatch = async (endpoint: string, data: any, token: string, idNote: string) => {
    
    console.log(data);
    
    try{
        const res = await fetch(`${DataUrl}/${endpoint}/${idNote}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(data),
            cache: 'no-store',
        });

        if(!res.ok){
            const errorData = await res.json().catch(() => ({}));
            
            let errorMessage = "Ocurrió un error desconocido";

            if (errorData.message){
                errorMessage = Array.isArray(errorData.message) 
                    ? errorData.message.join(', ') 
                    : errorData.message;
            }

            throw new Error(errorData);
        }

        return await res.json();

    } catch(error: any){
        console.error(error)
        throw new Error(error || "Error en actualizar nota D:<");
    }
}

export default fetchDataPatch;