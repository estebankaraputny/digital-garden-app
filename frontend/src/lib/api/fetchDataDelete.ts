const DataUrl = import.meta.env.PUBLIC_API_URL;

const fetchDataDelete = async (endpoint: string, token: string) => {
    try{

        const res = await fetch(`${DataUrl}/${endpoint}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,    
        },
        cache: "no-store",
    });
    }catch(error: any){
        console.log(error);
        throw new Error(error.message || "Error en borrar nota D:<");
    }
}

export default fetchDataDelete;
