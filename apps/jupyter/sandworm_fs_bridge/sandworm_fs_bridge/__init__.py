from .handlers import setup_handlers

def _jupyter_server_extension_points():
    return [{
        "module": "sandworm_fs_bridge",
    }]

def _load_jupyter_server_extension(nbapp):
    setup_handlers(nbapp.web_app)
    nbapp.log.info("Sandworm FS Bridge loaded.")