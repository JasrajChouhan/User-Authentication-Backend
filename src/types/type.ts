export interface userTypes {
    email : string;
    password : string ;
    username : string ;
}

export interface changePasswordTypes {
    userId : string,
    oldPassword : string,
    newPassword : string,
    confiromPassword : string 
}

export interface changeEmailTypes {
    oldEmail : string,
    newEmail : string
}