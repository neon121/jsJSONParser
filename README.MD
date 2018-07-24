<h1>IF/ELSEIF/ELSE conditions to JSON converter and back</h1>

Converts things like 
<pre>
if($Axis X == $Axis Y) {}
else if($Axis X == $Axis X) {}
else if($Axis X == $F) {}
else if($Axis X == $Axis X) {}
else if($Axis X == $Axis X) {}
else if($Axis X == $Axis X) {}
else if($Axis X == $Axis X) {}
</pre>

to JSON like 
<pre>
{
  "or": [
    {
      "field": "Axis X",
      "operator": "==",
      "value": "Axis Y"
    },
    {
      "field": "Axis X",
      "operator": "==",
      "value": "Axis X"
    },
    {
      "field": "Axis X",
      "operator": "==",
      "value": "F"
    },
    {
      "field": "Axis X",
      "operator": "==",
      "value": "Axis X"
    },
    {
      "field": "Axis X",
      "operator": "==",
      "value": "Axis X"
    },
    {
      "field": "Axis X",
      "operator": "==",
      "value": "Axis X"
    },
    {
      "field": "Axis X",
      "operator": "==",
      "value": "Axis X"
    }
  ]
}
</pre>

Back operation makes only 1 huge IF condition<br/>
Not absolutely clean, but without logical errors