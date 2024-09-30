
class ApiResponse {
    statusCode : number  ;
    message: string ; 
    data?: object | undefined;
    success : boolean;

    constructor(
        statusCode: number ,
        data ?: object, 
        message  : string= "Success"
    ) {
        
        this.statusCode = statusCode ;
        this.data = data;
        this.message = message ;
        this.success = statusCode < 400 // If status-code is greater then 400 then success is false.
    }
}


export default ApiResponse ;