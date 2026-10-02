from setuptools import find_packages, setup

# plotly is deliberately not a dependency: it comes from the image's pinned
# requirements.txt and is imported lazily, so this install never re-resolves it.
setup(
    name='sandworm_theme',
    version='0.1.0',
    packages=find_packages(exclude=['tests']),
    author='Sandworm Labs',
    description='Default colors, font and HTML building blocks for Sandworm notebooks',
    python_requires='>=3.9',
)
