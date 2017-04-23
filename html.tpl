{%- extends 'basic.tpl' -%}

{% block body %}
<div class="notebook-border">
  <div tabindex="-1" id="notebook" class="border-box-sizing">
    <div id="notebook-container">
      {{ super() }}
    </div>
  </div>
</div>
{%- endblock body %}
