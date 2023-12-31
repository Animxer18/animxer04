import { useContext, createContext, useCallback, useEffect, useState } from "react";
import { baseUrl, corsUrl, postRequest } from "../utilities/service";

export const AuthContext = createContext();

export const AuthContextProvider = ({children}) => {

    const [ user, setUser ] = useState(null);
    const [ registerError, setRegisterError ] = useState(null);
    const [ isRegisterLoading, setIsRegisterLoading ] = useState(false);
    const [ loginError, setLoginError ] = useState(null);
    const [ isLoginLoading, setIsLoginLoading ] = useState(false);

    const [ registerInfo, setRegisterInfo ] = useState({
        name: "",
        email: "",
        password: ""
    });
    const [ loginInfo, setLoginInfo ] = useState({
        email: "",
        password: ""
    });

    // console.log(user)
    // console.log(loginInfo)

    useEffect(() => {
        const user = localStorage.getItem("User")
        setUser(JSON.parse(user))
    }, [])

    // Register setRegisterInfo 
    const updateRegisterInfo = useCallback((info) => {
        setRegisterInfo(info);
    }, []);

    // login setLoginInfo
    const updateLoginInfo = useCallback((info) => {
        setLoginInfo(info);
    }, []);

    // register
    const registerUser = useCallback(async(e) => {
        e.preventDefault();
        setIsRegisterLoading(true);
        setRegisterError(null);

        const response = await postRequest(`${baseUrl}/users/register`, JSON.stringify(registerInfo));

        setIsRegisterLoading(false);

        if (response.error) {
            return setRegisterError(response);
        }

        localStorage.setItem("User", JSON.stringify(response)) // storing user to local storate
        setUser(response); // storing user to state
    }, [registerInfo]);

    // login
    const loginUser = useCallback(async(e)=> {
        e.preventDefault();
        setIsLoginLoading(true);
        setLoginError(null);

        const response = await postRequest(`${baseUrl}/users/login`, JSON.stringify(loginInfo));
        
        setIsLoginLoading(false);

        if (response.error) {
            return setLoginError(response);
        }

        localStorage.setItem("User", JSON.stringify(response))
        setUser(response)
    }, [loginInfo])

    // logout
    const logoutUser = useCallback(() => {
        localStorage.removeItem("User");
        setUser(null);
    }, []);

    // add bookmark
    const addBookmark = useCallback(async (slug, title, image, currentEpisode ) => {
        if (user) {
            const { _id } = user;
            const response = await postRequest(`${baseUrl}/users/add-bookmark`, JSON.stringify({ userId: _id, slug, title, image, currentEpisode}));
            if (!response.error) {
                setUser(response);
                const updatedUser = { ...user, bookmarked: response.bookmarked };
                localStorage.setItem('User', JSON.stringify(updatedUser));
            }
        }
    }, [user]);

    // remove bookmark
    const removeBookmark = useCallback(async (slug) => {
        if (user) {
            const { _id } = user;
            const response = await postRequest(`${baseUrl}/users/remove-bookmark`, JSON.stringify({ userId: _id, slug }));
            if (!response.error) {
                setUser(response);
                const updatedUser = { ...user, bookmarked: response.bookmarked };
                localStorage.setItem('User', JSON.stringify(updatedUser));
            }
        }
    }, [user]);

    // add a watched item
    const addWatchedItem = useCallback(async (title, slug, image, episodeId, episodeNumber) => {
        if (user) {
            const { _id } = user;
            const response = await postRequest(`${baseUrl}/users/add-watched`, JSON.stringify({ userId: _id, title, slug, image, episodeId, episodeNumber }));
            if (!response.error) {
                setUser(response);
                const updatedUser = { ...user, watched: response.watched };
                localStorage.setItem('User', JSON.stringify(updatedUser));
            }
        }
    }, [user]);

    // remove a watched item
    const removeWatchedItem = useCallback(async (watchedItemId) => {
        if (user) {
            const { _id } = user;
            const response = await postRequest(`${baseUrl}/users/remove-watched`, JSON.stringify({ userId: _id, watchedItemId }));
            if (!response.error) {
                setUser(response);
                const updatedUser = { ...user, watched: response.watched };
                localStorage.setItem('User', JSON.stringify(updatedUser));
            }
        }
    }, [user]);

    return (
        <AuthContext.Provider 
            value={{
                user,
                // Register user
                registerInfo,
                updateRegisterInfo,
                registerUser,
                registerError,
                isRegisterLoading,
                // Logout user
                logoutUser,
                // login user
                loginUser,
                updateLoginInfo,
                loginError,
                loginInfo,
                isLoginLoading,
                // bookmark
                addBookmark,
                removeBookmark,
                // watched
                addWatchedItem,
                removeWatchedItem,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export default function useAuthContext() {
    return useContext(AuthContext)
}