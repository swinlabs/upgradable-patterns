//IDENTIFICATION MANAGEMENT
//INDIVIDUAL FIELDS
id          //address
identification  //struct
    number 
name        //byte32
otherName   //byte32
dateOfBirth //byte32

address     //struct ADDRESS_STRUCT
    - address
    - suburd
    - state
    - country
portalAddress   //struct ADDRESS_STRUCT
telephone   //byte8
email       //byte32
occupation  //byte32
business    //string
    //in which way we should format this data, make it readable for analyzing
foreiner    //bool
bankAccounts     //struct[]
    //list of account in the form of struct
abn         //uint64

//INDIVIDUAL FIELDS
function verifyAddress

//INSTITUTION FIELDS
name            //string
bussinessName   //string

address     //struct ADDRESS_STRUCT
    - address
    - suburd
    - state
    - country
portalAddress   //struct ADDRESS_STRUCT
legalbusinessForm   //struct
    //need to define this form
businessActivity    //struct
    //also need to define this struct
telephone   //byte8
email       //string
abn         //uint64
acn         //uint64
arbn        //uint64
foreiner    //bool

//BANK FIELDS
entity  entityIdentification
bic     //uint256
bsb     //uint256
brn     //uint256
    //what about the branches

//TRANSMITTER

//TRANSACTION   IFTI-DRA 
referenceNumber //byte32
payerId   id //mapping to invididual
payerIdType     //byte32    //type of identification
payerBankAccount    //uint256   //account which used to transfer the money if applicable
payerCreditCardUsed      bool        //true, false
payeeId   id //mapping to invididual
payeeIdType     //byte32    //type of identification if applicable
payeeBankAccount    //uint256   //account which used to transfer the money if applicable 
acceptedDate    //byte32
availableDate   //byte32
value           //uint256
currency        //byte32
description     //string    //description of the transfer
originatedBank  //address   //mapping to the bank
receivedBank    //address   //mapping to the bank
transmitter     //address   //mapping to institution
type            byte32      //type of transaction such as inbound IFTI-DRA, IFTI-e







