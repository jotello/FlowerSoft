/* Returns probability of occuring below and above target price. */
function probability(price, target, days, volatility) {
  
  var p = price;
  var q = target;
  var t = days / 365;
  var v = volatility;
  
  var vt = v*Math.sqrt(t);
  var lnpq = Math.log(q/p);
  
  var d1 = lnpq / vt;
  
  var y = Math.floor(1/(1+.2316419*Math.abs(d1))*100000)/100000;
  var z = Math.floor(.3989423*Math.exp(-((d1*d1)/2))*100000)/100000;
  var y5 = 1.330274*Math.pow(y,5);
  var y4 = 1.821256*Math.pow(y,4);
  var y3 = 1.781478*Math.pow(y,3);
  var y2 = 0.356538*Math.pow(y,2);
  var y1 = 0.3193815*y;
  var x = 1-z*(y5-y4+y3-y2+y1);
  x = Math.floor(x*100000)/100000;
  
  if (d1<0) {x=1-x};
 
  var pabove = Math.floor(x*1000)/10; 
  var pbelow = Math.floor((1-x)*1000)/10;
             
  return [[pbelow],[pabove]]
}

​//  JavaScript adopted from Bernt Arne Odegaard's Financial Numerical Recipes
//  http://finance.bi.no/~bernt/gcc_prog/algoritms/algoritms/algoritms.html
//  by Steve Derezinski, CXWeb, Inc.  http://www.cxweb.com
//  Copyright (C) 1998  Steve Derezinski, Bernt Arne Odegaard
//
//  This program is free software; you can redistribute it and/or
//  modify it under the terms of the GNU General Public License
//  as published by the Free Software Foundation.
 
//  This program is distributed in the hope that it will be useful,
//  but WITHOUT ANY WARRANTY; without even the implied warranty of
//  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//  GNU General Public License for more details.
//  http://www.fsf.org/copyleft/gpl.html
 
function ndist(z) {
  return (1.0/(Math.sqrt(2*Math.PI)))*Math.exp(-0.5*z);
  //??  Math.exp(-0.5*z*z)
}
 
function N(z) {
  b1 =  0.31938153;
  b2 = -0.356563782;
  b3 =  1.781477937;
  b4 = -1.821255978;
  b5 =  1.330274429;
  p  =  0.2316419;
  c2 =  0.3989423;
  a=Math.abs(z);
  if (a>6.0) {return 1.0;} 
  t = 1.0/(1.0+a*p);
  b = c2*Math.exp((-z)*(z/2.0));
  n = ((((b5*t+b4)*t+b3)*t+b2)*t+b1)*t;
  n = 1.0-b*n;
  if (z < 0.0) {n = 1.0 - n;}
  return n;
}  
 
function fraction(z) {
// given a decimal number z, return a string with whole number + fractional string
// i.e.  z = 4.375, return "4 3/8"
 
  var whole = Math.floor(z);
  var fract = z - whole;
  var thirtytwos = Math.round(fract*32);
  if (thirtytwos == 0) {return whole + " ";}  //(if fraction is < 1/64)
  if (thirtytwos == 32) {return whole + 1;}  //(if fraction is > 63/64)
 
//32's non-trivial denominators: 2,4,8,16
  if (thirtytwos/16 == 1) { return whole + " 1/2";}
 
  if (thirtytwos/8 == 1) { return whole + " 1/4";}
  if (thirtytwos/8 == 3) { return whole + " 3/4";}
 
  if (thirtytwos/4 == Math.floor(thirtytwos/4)) {return whole + " " + thirtytwos/4 + "/8";}
 
  if (thirtytwos/2 == Math.floor(thirtytwos/2)) {return whole + " " + thirtytwos/2 + "/16";}
    else return whole + " " + thirtytwos + "/32";
 
} //end function
function black_scholes(call,S,X,r,v,t) { 
// call = Boolean (to calc call, call=True, put: call=false)
// S = stock prics, X = strike price, r = no-risk interest rate
// v = volitility (1 std dev of S for (1 yr? 1 month?, you pick)
// t = time to maturity
 
// define some temp vars, to minimize function calls
  var sqt = Math.sqrt(t);
  var Nd2;  //N(d2), used often
  var nd1;  //n(d1), also used often
  var ert;  //e(-rt), ditto
  var delta;  //The delta of the option
 
  d1 = (Math.log(S/X) + r*t)/(v*sqt) + 0.5*(v*sqt);
  d2 = d1 - (v*sqt);
 
  if (call) {
    delta = N(d1);
    Nd2 = N(d2);
  } else { //put
    delta = -N(-d1);
    Nd2 = -N(-d2);
  }
 
  ert = Math.exp(-r*t);
  nd1 = ndist(d1);
 
  gamma = nd1/(S*v*sqt);
  vega = S*sqt*nd1;
  theta = -(S*v*nd1)/(2*sqt) - r*X*ert*Nd2;
  rho = X*t*ert*Nd2;
 
  return ( S*delta-X*ert *Nd2);
 
} //end of black_scholes
 
function option_implied_volatility(call,S,X,r,t,o) { 
// call = Boolean (to calc call, call=True, put: call=false)
// S = stock prics, X = strike price, r = no-risk interest rate
// t = time to maturity
// o = option price
 
// define some temp vars, to minimize function calls
  sqt = Math.sqrt(t);
  MAX_ITER = 100;
  ACC = 0.0001;
 
  sigma = (o/S)/(0.398*sqt);
  for (i=0;i<MAX_ITER;i++) {
    price = black_scholes(call,S,X,r,sigma,t);
    diff = o-price;
    if (Math.abs(diff) < ACC) return sigma;
    d1 = (Math.log(S/X) + r*t)/(sigma*sqt) + 0.5*sigma*sqt;
    vega = S*sqt*ndist(d1);
    sigma = sigma+diff/vega;
  }
  return "Error, failed to converge";
 
} //end of option_implied_volatility

function call_iv(s,x,r,t,o) { return option_implied_volatility(true,s,x,r/100,t/365,o) }​
