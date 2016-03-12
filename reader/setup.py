

##
##
## setup.py for plotly-viewer/processFCS
##

from distutils.core import setup

setup(name='processFCS',
      description='FCS processing scripts',
      version='1.0',
      scripts=['scripts/processRawFCS.py'],
      license='Apache License, Version 2.0',
      classifiers=[
        'Intended Audience :: Developers',
        'License :: OSI Approved :: Apache Software License',
        'Programming Language :: Python',
        'Topic :: Internet :: WWW/HTTP',
        'Topic :: Software Development :: Libraries :: Python Modules'
      ])

