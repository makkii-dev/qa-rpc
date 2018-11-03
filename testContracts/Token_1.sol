pragma solidity ^0.4.0;
contract MyToken{
    event Transfer(address _from, address _to, uint128 _value);
    event Approval(address _owner, address  _spender, uint128 _value);

    string public name;  
    string public symbol;  
    uint8 public decimals; 
    uint128 tokenSupply;
    
    mapping(address => uint128) balances; 
    mapping(address => mapping (address => uint128)) allowed;

    function MyToken(uint128 initialSupply, string tokenName, string tokenSymbol, uint8 decimalUnits){ 
        balances[msg.sender] = initialSupply; 
        tokenSupply = initialSupply;
        name = tokenName;
        symbol = tokenSymbol;
        decimals = decimalUnits;
    }
    
    function approve(address _spender, uint128 _value) returns (bool success) {
        if (balances[msg.sender] < _value) return false;
        allowed[msg.sender][_spender] = _value;
        Approval(msg.sender, _spender, _value);
        return true;
    }

    function transferFrom(address _from, address _to, uint128 _value) returns (bool success) {
        if (balances[_from] < _value 
            || _value <= 0
            || balances[_to] + _value < balances[_to]
            || allowed[_from][msg.sender] < _value) return false;
            
        balances[_from] -= _value;
        balances[_to] += _value;  
        allowed[_from][msg.sender] -= _value;        
        Transfer(msg.sender, _to, _value);
        return true;
    }

    function totalSupply() constant returns (uint128 totalSupply){
        return tokenSupply;
    }

    function balanceOf(address _owner) constant returns (uint128 balance) {
        return balances[_owner];
    }
    
    function transfer(address _to, uint128 _value) returns (bool success) {
        if (balances[msg.sender] < _value 
            || _value <= 0
            || balances[_to] + _value <= balances[_to]
        ) return false;    
            
        balances[msg.sender] -= _value;
        balances[_to] += _value;    

        Transfer(msg.sender, _to, _value);
        return true;
    }
    
    function allowance(address _owner, address _spender) constant returns (uint128 remaining) {
        return allowed[_owner][_spender];
    }
}
