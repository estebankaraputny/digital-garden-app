const DataUrl = import.meta.env.PUBLIC_API_URL;

const fetchDataGetWithToken = async (endpoint: string, token: string) => {
    try{

        const response = await fetch(`${DataUrl}/${endpoint}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,       
        },
        cache: "no-store",
    });

    if(!response.ok){
        const errorMessage = await response.json().catch(() => ({}));
        console.log(errorMessage);
        throw new Error(errorMessage || "Error en el fetch :o");
    };

    const data = await response.json();
   
    return data;

    }catch(error: any){
        console.log(error);
        throw new Error(error.message || "Error en obtener datos D:<");
    }
}

export default fetchDataGetWithToken;
