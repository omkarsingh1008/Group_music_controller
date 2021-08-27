from .models import SpotifyToken
from django.utils import timezone
from datetime import timedelta
from requests import Request,post,put,get
from .credentials import REDIRECT_URI,CLIENT_ID,CLIENT_SECRET

BASE_URL = "https://api.spotify.com/v1/me/"

def get_user_token(session_id):
    user_tokens=SpotifyToken.objects.filter(user=session_id)
    #print(user_tokens)
    if user_tokens.exists():

        return user_tokens[0]
    else:
        return None
    




def update_or_create_user_tokens(session_id, access_token, token_type, expires_in, refresh_token):
    
    tokens=get_user_token(session_id)
    print(tokens)
    expires_in = timezone.now() + timedelta(seconds=expires_in)

    if tokens:
        tokens.access_token = access_token
        tokens.refresh_token = refresh_token
        tokens.expires_in = expires_in
        tokens.token_type = token_type
        tokens.save(update_fields=['access_token','refresh_token','expires_in','token_type'])
    else:
        tokens =SpotifyToken(user=session_id,access_token=access_token,expires_in=expires_in,refresh_token=refresh_token,token_type=token_type)
        tokens.save()

def is_spotify_token_authenticated(session_id):
    tokens = get_user_token(session_id)
    #print(tokens)

    if tokens:
        expiry = tokens.expires_in

        if expiry <= timezone.now():
            refresh_spotify_token(session_id)
        return True
    return False

def refresh_spotify_token(session_id):
    refresh_token = get_user_token(session_id).refresh_token
    
    response = post('https://accounts.spotify.com/api/token', data={
        'grant_type': 'refresh_token',
        'refresh_token': refresh_token,
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET
    }).json()

    access_token = response.get('access_token')
    token_type = response.get('token_type')
    expires_in = response.get('expires_in')
    
    print(expires_in)

    update_or_create_user_tokens(session_id, access_token, token_type, expires_in, refresh_token)

def execute_spotify_api_request(session_id, endpoint, post_=False, put_=False):
    #print(session_id)
    tokens = get_user_token(session_id)
    #print(tokens)
    headers = {'Content-Type': 'application/json',
               'Authorization': "Bearer " + tokens.access_token}
    #print(headers)
    if post_:
        post(BASE_URL + endpoint, headers=headers)
    if put_:
        h=put(BASE_URL + endpoint, headers=headers)
        print(h)

    response = get(BASE_URL + endpoint, {}, headers=headers)
    #print(response)
    try:
        return response.json()
    except:
        return {'Error': 'Issue with request'}

def play_song(session_id):
    return execute_spotify_api_request(session_id,'player/play', put_=True)

def pause_song(session_id):
    return execute_spotify_api_request(session_id,'player/pause', put_=True)

