{%- extends 'basic.tpl' -%}

{% block body %}
<div>
  {% for css in resources.inlining.css -%}
      <style scoped>
      {{ css }}
      </style>
  {% endfor %}

  <style scoped>
  /* Overrides of notebook CSS for static HTML export */
  body {
    overflow: visible;
    padding: 8px;
  }

  div#notebook {
    overflow: visible;
    border-top: none;
  }

  @media print {
    div.cell {
      display: block;
      page-break-inside: avoid;
    }
    div.output_wrapper {
      display: block;
      page-break-inside: avoid;
    }
    div.output {
      display: block;
      page-break-inside: avoid;
    }
  }
  </style>

  <div tabindex="-1" id="notebook" class="border-box-sizing">
    <div id="notebook-container">
{{ super() }}
    </div>
  </div>
</div>
{%- endblock body %}
