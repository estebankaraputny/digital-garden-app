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
            const errorData = await res.json();
            
            Array.isArray(errorData.message) 
            ? errorData.message.join(', ') 
            : errorData.message;

            const finalMessage = errorData.message || "Error desconocido";

                throw new Error(finalMessage);
            }

        return await res.json();

    } catch(error: any){
        console.error(error)
        throw new Error(error || "Error en actualizar nota D:<");
    }
}

export default fetchDataPatch;