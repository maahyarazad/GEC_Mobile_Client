<?php
   
   //If referer is set and doesn't come from admin
   if(isset($_SERVER['HTTP_REFERER']) && strpos($_SERVER['HTTP_REFERER'], 'german-emirates-club.com') == false) {
      header("Location: https://www.german-emirates-club.com/"); 
      exit();
   } 

   //Take parameter passed from admin and save to cookie for frontend autologin
   else if(!empty($_GET['__au_ol'])){
      setcookie("__au_ol",$_GET['__au_ol'],time() + 10,'/'); //expires in 10 seconds only for security
      setcookie("__i_a_u",'Mk8sydojlk$%ksdjfpnglghs090fm',time() + 3600,'/');
      // var_dump($_GET); exit();
   }

   //Ask to relogin if no request params
   else if(empty($_COOKIE['__i_a_u'])) {
      header("Location: https://www.german-emirates-club.com/admin"); 
      exit();
    }
   
   readfile("index.html");
?>
