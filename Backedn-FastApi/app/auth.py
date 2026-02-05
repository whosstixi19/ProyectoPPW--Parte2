"""Módulo de autenticación con Firebase para FastAPI."""

from fastapi import Header, HTTPException, status
from firebase_admin import auth
from typing import Optional


async def verify_firebase_token(authorization: Optional[str] = Header(None)):
    """
    Dependency para verificar el token de Firebase en los headers.
    
    Args:
        authorization: Header Authorization con formato "Bearer <token>"
    
    Returns:
        dict: Datos del usuario decodificados del token
    
    Raises:
        HTTPException: Si el token es inválido o no existe
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header missing"
        )
    
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header format"
        )
    
    token = authorization.split("Bearer ")[1]
    
    try:
        # Verificar el token con Firebase
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except auth.InvalidIdTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error verifying token: {str(e)}"
        )
