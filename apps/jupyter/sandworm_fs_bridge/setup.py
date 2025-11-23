from setuptools import find_packages, setup

setup(
    name='sandworm_fs_bridge',
    version='0.1.0',
    packages=find_packages(),
    include_package_data=True,
    install_requires=[
        'jupyter_server>=2.0.0',  # More specific, 'notebook' is deprecated
    ],
    entry_points={
        'jupyter_server.extensions': [
            'sandworm_fs_bridge = sandworm_fs_bridge:_load_jupyter_server_extension',
        ],
    },
    author='Sandworm Labs',
    description='Filesystem API bridge for Jupyter Server',
    python_requires='>=3.8',
)