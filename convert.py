from __future__ import print_function
import sys
import os
from nbconvert import HTMLExporter

class MyExporter(HTMLExporter):
    @property
    def template_path(self):
        """
        We want to inherit from HTML template, and have template under
        `./templates/` so append it to the search path. (see next section)
        """
        return super().template_path + [os.path.dirname(__file__)]

    def _template_file_default(self):
        """
        We want to use the new template we ship with our library.
        """
        return 'html'

def main(ipynb_file):
    exporter = MyExporter()
    print(exporter.from_filename(ipynb_file)[0])

main(sys.argv[1])
