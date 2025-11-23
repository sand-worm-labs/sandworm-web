from jupyter_server.base.handlers import JupyterHandler
import tornado
import os
import json
import mimetypes
import asyncio
from typing import Dict, Any, Optional

CHUNK_SIZE = 10 * 1024 * 1024  
FLUSH_THRESHOLD = 10 * 1024 * 1024  

class BaseFileHandler(JupyterHandler):
    """Base handler with common utilities"""
    
    def json_error(self, status: int, reason: str) -> None:
        """Send JSON error response"""
        self.set_status(status)
        self.set_header("Content-Type", "application/json")
        self.finish(json.dumps({"reason": reason}))
    
    def json_response(self, data: Dict[str, Any]) -> None:
        """Send JSON success response"""
        self.set_header("Content-Type", "application/json")
        self.finish(json.dumps(data))
    
    def get_file_info(self, file_path: str) -> Dict[str, Any]:
        """Get file metadata as dictionary"""
        stat_info = os.stat(file_path)
        return {
            "name": os.path.basename(file_path),
            "path": file_path,
            "size": stat_info.st_size,
            "modified": stat_info.st_mtime,
            "created": stat_info.st_ctime,
            "mimeType": mimetypes.guess_type(file_path)[0],
            "isDirectory": os.path.isdir(file_path)
        }
    
    def validate_path(self, path: str, must_exist: bool = True, 
                      must_be_file: bool = False, 
                      must_be_dir: bool = False) -> Optional[str]:
        """
        Validate file path and return error reason if invalid
        Returns None if valid
        """
        if must_exist and not os.path.exists(path):
            return "not-found"
        
        if must_be_file and os.path.isdir(path):
            return "is-directory"
        
        if must_be_dir and not os.path.isdir(path):
            return "not-directory"
        
        return None


class ListFilesHandler(BaseFileHandler):
    @tornado.web.authenticated
    def get(self):
        dir_path = self.get_query_argument("dirPath")
        self.log.info(f"List files: {dir_path}")
        
        error = self.validate_path(dir_path, must_be_dir=True)
        if error:
            self.log.error(f"Invalid directory: {dir_path}")
            return self.json_error(400, error)

        files_info = [
            self.get_file_info(os.path.join(dir_path, filename))
            for filename in os.listdir(dir_path)
        ]

        self.log.info(f"Returning {len(files_info)} files")
        self.json_response(files_info)


class StatFileHandler(BaseFileHandler):
    @tornado.web.authenticated
    def get(self):
        file_path = self.get_query_argument("filePath")
        self.log.info(f"Stat file: {file_path}")
        
        error = self.validate_path(file_path, must_be_file=True)
        if error:
            status = 404 if error == "not-found" else 400
            return self.json_error(status, error)

        self.json_response(self.get_file_info(file_path))


class ReadFileHandler(BaseFileHandler):
    @tornado.web.authenticated
    async def get(self):
        file_path = self.get_query_argument("filePath")
        self.log.info(f"Read file: {file_path}")
        
        error = self.validate_path(file_path, must_be_file=True)
        if error:
            status = 404 if error == "not-found" else 400
            return self.json_error(status, error)

        self.set_header("Content-Type", "application/octet-stream")
        self.set_header("Content-Disposition", 
                       f'attachment; filename="{os.path.basename(file_path)}"')

        loop = asyncio.get_event_loop()
        with open(file_path, 'rb') as file:
            while chunk := await loop.run_in_executor(None, file.read, CHUNK_SIZE):
                self.write(chunk)
                await self.flush()

        self.log.info(f"Finished reading: {file_path}")
        await self.finish()


@tornado.web.stream_request_body
class WriteFileHandler(BaseFileHandler):
    def initialize(self):
        self.file = None
        self.file_path = None
        self.bytes_since_flush = 0

    async def data_received(self, chunk: bytes):
        if self.file is None:
            self.file_path = self.get_query_argument("filePath")
            self.log.info(f"Write file: {self.file_path}")
            
            if not self.file_path:
                return self.json_error(400, "file-path-not-specified")

            if os.path.isdir(self.file_path):
                return self.json_error(400, "is-directory")
            
            self.file = open(self.file_path, "wb")

        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, self.file.write, chunk)
        self.bytes_since_flush += len(chunk)

        if self.bytes_since_flush > FLUSH_THRESHOLD:
            await loop.run_in_executor(None, self.file.flush)
            self.bytes_since_flush = 0

    @tornado.web.authenticated
    async def post(self):
        if not self.file:
            return self.json_error(400, "no-data")
        
        self.file.close()
        self.log.info(f"Finished writing: {self.file_path}")
        self.json_response(self.get_file_info(self.file_path))


class RemoveFileHandler(BaseFileHandler):
    @tornado.web.authenticated
    async def delete(self):
        file_path = self.get_query_argument("filePath")
        self.log.info(f"Remove file: {file_path}")
        
        error = self.validate_path(file_path, must_be_file=True)
        if error:
            status = 404 if error == "not-found" else 400
            return self.json_error(status, error)

        file_info = self.get_file_info(file_path)
        
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, os.remove, file_path)
        self.log.info(f"Removed: {file_path}")

        self.json_response(file_info)


class PingHandler(BaseFileHandler):
    @tornado.web.authenticated
    def get(self):
        self.log.info("Ping")
        self.finish("pong")


class CWDHandler(BaseFileHandler):
    @tornado.web.authenticated
    def get(self):
        cwd = os.getcwd()
        self.log.info(f"CWD: {cwd}")
        self.json_response({"cwd": cwd})


def setup_handlers(web_app):
    base_url = web_app.settings["base_url"]
    base = f"{base_url}api/sandworm"  # Changed from 'briefer'

    handlers = [
        (f"{base}/files/list", ListFilesHandler),
        (f"{base}/files/stat", StatFileHandler),
        (f"{base}/files/read", ReadFileHandler),
        (f"{base}/files/write", WriteFileHandler),
        (f"{base}/files/remove", RemoveFileHandler),
        (f"{base}/ping", PingHandler),
        (f"{base}/cwd", CWDHandler),
    ]
    
    web_app.add_handlers(".*$", handlers)